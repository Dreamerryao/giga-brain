import { useMutation } from '@tanstack/react-query';
import { deserializeTx, serializeTx } from '@repo/lib/src/program/tx';
import { supabase } from '@repo/lib/src/supabase';
import { retry } from '@repo/lib/src/promise';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  formatNumber,
  fromLamports,
  fromLamportsBN,
  toLamportsBN,
} from '@repo/lib/src/bn';

import { getAgentRoute } from '@/lib/routes';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { GIGA_MINT, IS_PROD, METADATA, TOKENS } from '@/config';
import { useUI } from '@/providers/ui';
import { CreatePuzzleGame, CreatePuzzleCurrency } from '@/app/agents/new/page';

import { useStatus } from '../useStatus';

import { useFinalizeCreatePuzzleMutation } from './trpc/useFinalizeCreatePuzzleMutation';
import { useInitCreatePuzzleMutation } from './trpc/useInitCreatePuzzleMutation';

export function useCreateAgentMutation(
  game: CreatePuzzleGame,
  gigaPuzzleCurrency: CreatePuzzleCurrency,
  solPuzzleCurrency: CreatePuzzleCurrency
) {
  const setStatus = useStatus();
  const router = useRouter();
  const {
    publicKey: creatorPubkey,
    solBalance,
    gigaBalance,
    uiSignTx,
  } = useSolanaWallet();
  const {
    connectModal: { setIsOpened },
  } = useUI();

  const [formData, setFormData] = useState<{
    name: string;
    prompt: string;
    funds: string;
    avatar: File | null;
    model: string;
    currency: 'SOL' | 'GIGA🧠';
    baseFee: string;
    maxFee: string;
    maxAttempts: string;
    attemptTimeoutHours: string;
    attemptFinalTimeoutHours: string;
    metadata: string;
  }>({
    name: '',
    prompt: '',
    funds: '',
    avatar: null,
    model: 'gpt-4o-mini',
    currency: 'GIGA🧠',
    baseFee: '0',
    maxFee: '0',
    maxAttempts: '0',
    attemptTimeoutHours: '0',
    attemptFinalTimeoutHours: '0',
    metadata: METADATA,
  });

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${formData.name || 'default'}`;

  const { mint, decimals } = useMemo(() => {
    const { mint, decimals } = TOKENS.get(formData.currency)!;
    return {
      mint,
      decimals,
    };
  }, [formData.currency]);

  const balance = useMemo(
    () => (mint.equals(GIGA_MINT) ? gigaBalance : solBalance),
    [mint, solBalance, gigaBalance]
  );

  const puzzleCurrency = useMemo(() => {
    return mint.equals(GIGA_MINT) ? gigaPuzzleCurrency : solPuzzleCurrency;
  }, [mint, gigaPuzzleCurrency, solPuzzleCurrency]);

  useEffect(() => {
    if (puzzleCurrency && game) {
      setFormData((prev) => ({
        ...prev,
        funds: fromLamports(
          puzzleCurrency.minimum_initial_prize.toString(),
          decimals
        ).toString(),
        baseFee: fromLamports(
          puzzleCurrency.base_fee.toString(),
          decimals
        ).toString(),
        maxFee: fromLamports(
          puzzleCurrency.max_fee.toString(),
          decimals
        ).toString(),
        maxAttempts: game.max_attempts.toString(),
        attemptTimeoutHours: (
          game.puzzle_attempt_timeout_seconds /
          60 /
          60
        ).toString(),
        attemptFinalTimeoutHours: (
          game.puzzle_attempt_final_timeout_seconds /
          60 /
          60
        ).toString(),
      }));
    }
  }, [puzzleCurrency, game, decimals]);

  const initCreatePuzzle = useInitCreatePuzzleMutation();
  const finalizeCreatePuzzle = useFinalizeCreatePuzzleMutation();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const prompt = formData.prompt.trim();
        if (!prompt) {
          return;
        }
        if (!creatorPubkey) {
          setIsOpened(true);
          throw new Error('Please connect your wallet');
        }

        const funds = toLamportsBN(formData.funds, decimals);

        if (balance.lt(funds)) {
          throw new Error(
            `Insufficient ${formatNumber(
              fromLamportsBN(balance, decimals),
              4
            )} ${formData.currency} balance. Required: ${formatNumber(
              fromLamportsBN(funds, decimals),
              4
            )} ${formData.currency}. ${
              IS_PROD ? '' : 'Get some from Faucet in the Wallet menu.'
            }`
          );
        }

        if (funds.lt(puzzleCurrency.minimum_initial_prize)) {
          throw new Error(
            `The minimum initial agent funds should be at least ${formatNumber(
              fromLamportsBN(puzzleCurrency.minimum_initial_prize, decimals),
              4
            )} ${formData.currency}.`
          );
        }

        const maxAttempts = Number(formData.maxAttempts);
        if (maxAttempts < game.max_attempts) {
          throw new Error(
            `Max attempts should be at least ${game.max_attempts}.`
          );
        }

        const baseFee = toLamportsBN(formData.baseFee, decimals);
        if (baseFee.lt(puzzleCurrency.base_fee)) {
          throw new Error(
            `Base fee should be at least ${formatNumber(
              fromLamportsBN(puzzleCurrency.base_fee, decimals),
              4
            )} ${formData.currency}.`
          );
        }

        const maxFee = toLamportsBN(formData.maxFee, decimals);
        if (maxFee.gt(puzzleCurrency.max_fee)) {
          throw new Error(
            `Max fee should be at most ${formatNumber(
              fromLamportsBN(puzzleCurrency.max_fee, decimals),
              4
            )} ${formData.currency}.`
          );
        }

        if (baseFee.gte(maxFee)) {
          throw new Error('Max fee must be greater than base fee.');
        }

        const attemptTimeoutSeconds =
          Number(formData.attemptTimeoutHours) * 60 * 60;
        if (attemptTimeoutSeconds < game.puzzle_attempt_timeout_seconds) {
          throw new Error(
            `Normal timer must be greater than ${game.puzzle_attempt_timeout_seconds / 60 / 60} hours.`
          );
        }

        const attemptFinalTimeoutSeconds =
          Number(formData.attemptFinalTimeoutHours) * 60 * 60;
        if (
          attemptFinalTimeoutSeconds < game.puzzle_attempt_final_timeout_seconds
        ) {
          throw new Error(
            `Final timer must be greater than ${game.puzzle_attempt_final_timeout_seconds / 60 / 60} hours.`
          );
        }

        const fileType = formData.avatar?.type ?? null;

        const {
          tx: initializedTx,
          puzzlePDA,
          blockhashWithExpiryBlockHeight,
          commitment,
        } = await initCreatePuzzle.mutateAsync({
          prompt,
          mint: mint.toBase58(),
          metadata: formData.metadata,
          model: formData.model,
          name: formData.name,
          creator: creatorPubkey.toBase58(),
          prizeAmount: Number(formData.funds),
          fileType,
          avatarUrl: defaultAvatar,
          baseFee: Number(formData.baseFee),
          maxFee: Number(formData.maxFee),
          maxAttempts: Number(formData.maxAttempts),
          attemptTimeoutSeconds: attemptTimeoutSeconds,
          attemptFinalTimeoutSeconds: attemptFinalTimeoutSeconds,
        });

        if (!initializedTx) {
          throw new Error('Failed to initialize attempt');
        }

        const signedTx = await uiSignTx({
          tx: deserializeTx(initializedTx),
          setStatus,
        });

        const { signedUploadUrl, signature } =
          await finalizeCreatePuzzle.mutateAsync({
            tx: serializeTx({
              tx: signedTx,
              requireAllSignatures: false,
            }),
            prompt,
            metadata: formData.metadata,
            blockhashWithExpiryBlockHeight,
            commitment,
            mint: mint.toBase58(),
          });

        setStatus({ status: 'sent', data: signature });

        if (formData.avatar && signedUploadUrl) {
          await fetch(signedUploadUrl, {
            method: 'PUT',
            // headers: {
            //   'Content-Type': fileType,
            // },
            body: formData.avatar,
          });
        }

        await retry<string | null>(
          async () => {
            return (
              (
                await supabase
                  .from('puzzle')
                  .select('public_key')
                  .eq('public_key', puzzlePDA)
              ).data?.[0]?.public_key ?? null
            );
          },
          (pubKey) => {
            // eslint-disable-next-line no-console
            console.log({ pubKey });
            return !!pubKey;
          }
        );

        router.push(getAgentRoute(puzzlePDA));
      } catch (error) {
        setStatus({ status: 'failed', message: errorParser(error as Error) });
        throw error;
      }
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    formData,
    setFormData,
    defaultAvatar,
    isPending: mutation.isPending,
    puzzleCurrency,
    mint,
    decimals,
  };
}

function errorParser(error: Error) {
  const message = error.message;
  switch (true) {
    case message.includes('InsufficientFunds'):
      return 'You do not have enough funds to create this puzzle.';
    case message.includes('InsufficientPrize'):
      return 'The minimum initial agent funds set is too low.';
    case message.includes('InvalidMaxAttempts'):
      return 'Max attempts is too low.';
    case message.includes('InvalidBaseFee'):
      return 'Base fee is too low.';
    case message.includes('InvalidMaxFee'):
      return 'Max fee is too high.';
    case message.includes('InvalidBaseFeeAndMaxFee'):
      return 'Max fee must be greater than base fee.';
    case message.includes('InvalidAttemptTimeoutSeconds'):
      return 'Attempt timeout is too low.';
    case message.includes('InvalidAttemptFinalTimeoutSeconds'):
      return 'Attempt final timeout is too low.';
    default:
      return message;
  }
}
