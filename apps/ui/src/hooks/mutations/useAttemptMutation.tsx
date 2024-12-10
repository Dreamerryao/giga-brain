import { useMutation } from '@tanstack/react-query';
import { deserializeTx, serializeTx } from '@repo/lib/src/program/tx';
import * as anchor from '@coral-xyz/anchor';
import { supabase } from '@repo/lib/src/supabase';
import { retry } from '@repo/lib/src/promise';
import { formatNumber, fromLamports, toBigNumber } from '@repo/lib/src/bn';
import { useState } from 'react';

import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { queryClient } from '@/providers/query';
import { AGENT_QUERY_KEY } from '@/hooks/queries/useAgentQuery';
import { AGENT_MESSAGES_QUERY_KEY } from '@/hooks/queries/useAgentMessagesQuery';
import { GIGA_MINT, IS_PROD, TOKENS_LIST } from '@/config';
import { useUI } from '@/providers/ui';
import { ChatMode } from '@/types';

import { useStatus } from '../useStatus';

import { useInitRecordAttemptMutation } from './trpc/useInitRecordAttemptMutation';
import { useFinalizeRecordAttemptMutation } from './trpc/useFinalizeRecordAttemptMutation';

export function useAttemptMutation() {
  const setStatus = useStatus();
  const {
    publicKey: solverPubkey,
    solBalance,
    gigaBalance,
    uiSignTx,
  } = useSolanaWallet();
  const {
    connectModal: { setIsOpened },
  } = useUI();

  const [message, setMessage] = useState('');

  const initRecordAttempt = useInitRecordAttemptMutation();
  const finalizeRecordAttempt = useFinalizeRecordAttemptMutation();

  const mutation = useMutation({
    mutationFn: async ({
      currentFee,
      puzzlePubkey,
      mint,
      mode,
    }: {
      currentFee: number;
      puzzlePubkey: string;
      mint: anchor.web3.PublicKey;
      mode: ChatMode;
    }) => {
      const metadata = JSON.stringify({ myChat: mode === 'personal' });

      const [symbol, { decimals }] = TOKENS_LIST.find((t) =>
        t[1].mint.equals(mint)
      )!;

      const balance = mint.equals(GIGA_MINT) ? gigaBalance : solBalance;

      try {
        if (!solverPubkey) {
          setIsOpened(true);
          throw new Error('Please connect your wallet');
        }

        const prompt = message.trim();
        if (!prompt) {
          throw new Error('Please enter a message');
        }

        if (balance.lt(toBigNumber(currentFee))) {
          throw new Error(
            `Insufficient ${symbol} balance. Required: ${formatNumber(
              fromLamports(currentFee, decimals),
              4
            )} ${symbol}. ${
              IS_PROD ? '' : 'Get some from Faucet in the Wallet menu.'
            }`
          );
        }

        const getSolverLatestAttempt = async (): Promise<string | null> =>
          (
            await supabase
              .from('puzzle_attempt')
              .select('id')
              .eq('puzzle', puzzlePubkey)
              .eq('solver', solverPubkey)
              .order('created_at', { ascending: false })
          ).data?.[0]?.id ?? null;

        const refetchQueries = async () => {
          await queryClient.refetchQueries({
            queryKey: [AGENT_QUERY_KEY, puzzlePubkey],
          });
          await queryClient.refetchQueries({
            queryKey: [AGENT_MESSAGES_QUERY_KEY, puzzlePubkey],
          });
        };

        const oldAttemptId = await getSolverLatestAttempt();

        const {
          tx: initializedTx,
          blockhashWithExpiryBlockHeight,
          commitment,
        } = await initRecordAttempt.mutateAsync({
          puzzlePDA: puzzlePubkey,
          solver: solverPubkey.toBase58(),
          prompt,
          metadata,
          maxFee: fromLamports(currentFee, decimals),
        });

        if (!initializedTx) {
          throw new Error('Failed to initialize attempt');
        }

        const signedTx = await uiSignTx({
          tx: deserializeTx(initializedTx),
          setStatus,
        });

        let signature: string | null = null;

        const res = await finalizeRecordAttempt.mutateAsync({
          tx: serializeTx({
            tx: signedTx,
            requireAllSignatures: false,
          }),
          mint: mint.toBase58(),
          prompt,
          metadata,
          blockhashWithExpiryBlockHeight,
          commitment,
        });
        signature = res.signature;

        if (signature) {
          setMessage('');
          setStatus({ status: 'sent', data: signature });
        }

        const newAttemptId = await retry<string | null>(
          getSolverLatestAttempt,
          (newAttemptId) => {
            // eslint-disable-next-line no-console
            console.log({ newAttemptId, oldAttemptId });
            return newAttemptId !== oldAttemptId;
          }
        );

        // await refetchQueries();

        await retry<string | null>(
          async () => {
            const { data } = await supabase
              .from('puzzle_attempt')
              .select('response')
              .eq('id', newAttemptId);
            return data?.[0]?.response ?? null;
          },
          (response) => {
            // eslint-disable-next-line no-console
            console.log({ response });
            return !!response;
          }
        );
        await refetchQueries();
      } catch (error) {
        setStatus({ status: 'failed', message: errorParser(error as Error) });
        throw error;
      }
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    setMessage,
    message,
    isPending: mutation.isPending,
  };
}

function errorParser(error: Error) {
  const message = error.message;
  switch (true) {
    case message.includes('InvalidSolver'):
      return 'Creator cannot attempt to solve their own puzzle.';
    case message.includes('PuzzleNotActive'):
      return 'Agent not active.';
    case message.includes('PuzzleTimedOut'):
      return 'Agent timed out.';
    case message.includes('MaxFeeExceeded'):
      return 'Please refresh page to get latest Agent fee.';
    case message.includes('PuzzleInAttemptedState'):
      return 'Agent is processing a previous attempt. Please wait a few seconds and try again.';
    default:
      return message;
  }
}
