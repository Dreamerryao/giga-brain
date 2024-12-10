import { useMutation } from '@tanstack/react-query';
import { deserializeTx } from '@repo/lib/src/program/tx';
import { retry } from '@repo/lib/src/promise';
import { supabase } from '@repo/lib/src/supabase';

import { queryClient } from '@/providers/query';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';

import { useProgress } from '../useProgress';
import { useStatus } from '../useStatus';
import { NOTIFICATIONS_QUERY_KEY } from '../queries/useNotificationsQuery';

import { useClaimTimeoutMutation as useTrpcClaimTimeoutMutation } from './trpc/useClaimTimeoutMutation';
import { useClaimPrizeMutation as useTrpcClaimPrizeMutation } from './trpc/useClaimPrizeMutation';

export function useClaimTimeoutMutation(puzzlePDA: string) {
  return useClaimMutation(puzzlePDA, false);
}

export function useClaimPrizeMutation(puzzlePDA: string) {
  return useClaimMutation(puzzlePDA, true);
}

export function useClaimMutation(puzzlePDA: string, isPrize: boolean) {
  const { isDone, done } = useProgress();
  const { uiSignAndSendTx } = useSolanaWallet();
  const setStatus = useStatus();

  const claimTimeoutMutation = useTrpcClaimTimeoutMutation();
  const claimPrizeMutation = useTrpcClaimPrizeMutation();

  const mutation = useMutation({
    mutationKey: ['claim', puzzlePDA, isPrize],
    mutationFn: async () => {
      try {
        const { tx: initializedTx } = await (
          isPrize
            ? claimPrizeMutation.mutateAsync
            : claimTimeoutMutation.mutateAsync
        )({
          puzzlePDA,
        });
        const deserializedTx = deserializeTx(initializedTx);

        await uiSignAndSendTx({
          tx: deserializedTx,
          setStatus,
        });

        await retry<string | null>(
          async () => {
            const { data } = await supabase
              .from('puzzle')
              .select('status')
              .eq('public_key', puzzlePDA);
            return data?.[0]?.status ?? null;
          },
          (status) => {
            // eslint-disable-next-line no-console
            console.log({ status, public_key: puzzlePDA });
            return !!status && ['Completed', 'TimedOut'].includes(status);
          }
        );

        await queryClient.refetchQueries({
          queryKey: [NOTIFICATIONS_QUERY_KEY],
        });
      } catch (error) {
        setStatus({ status: 'failed', message: errorParser(error as Error) });
        throw error;
      }
    },
  });

  const mutateAsync = async () => {
    await done(async () => {
      await mutation.mutateAsync();
    });
  };

  return {
    mutation,
    mutateAsync,
    isPending: mutation.isPending,
    isDone,
    isSuccess: mutation.isSuccess,
  };
}

function errorParser(error: Error) {
  const message = error.message;
  switch (true) {
    case message.includes('InvalidPuzzleSolver'):
      return 'You are not the solver of this puzzle.';
    case message.includes('PuzzleStillInFinalTimer'):
      return 'Puzzle is still in final timer.';
    case message.includes('PuzzleStillActive'):
      return 'Puzzle is still active.';
    default:
      return message;
  }
}
