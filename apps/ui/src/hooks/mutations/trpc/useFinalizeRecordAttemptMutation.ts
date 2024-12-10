import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

export function useFinalizeRecordAttemptMutation() {
  return useMutation({
    mutationFn: async (input: {
      mint: string;
      tx: string;
      prompt: string;
      metadata: string;
      blockhashWithExpiryBlockHeight: {
        blockhash: string;
        lastValidBlockHeight: number;
      };
      commitment: string;
    }) => {
      const res = await api('/finalize-record-attempt', input);
      return res as {
        signature: string;
      };
    },
  });
}
