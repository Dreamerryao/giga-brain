import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

export function useInitRecordAttemptMutation() {
  return useMutation({
    mutationFn: async (input: {
      puzzlePDA: string;
      solver: string;
      prompt: string;
      maxFee: number;
      metadata: string;
    }) => {
      const res = await api('/init-record-attempt', input);
      return res as {
        tx: string;
        metadata: string;
        blockhashWithExpiryBlockHeight: {
          blockhash: string;
          lastValidBlockHeight: number;
        };
        commitment: string;
      };
    },
  });
}
