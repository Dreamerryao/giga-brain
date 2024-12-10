import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

export function useInitCreatePuzzleMutation() {
  return useMutation({
    mutationFn: async (input: {
      creator: string;
      prompt: string;
      prizeAmount: number;
      name: string;
      fileType: string | null;
      avatarUrl: string | null;
      model: string;
      mint: string;
      metadata: string;
      baseFee: number;
      maxFee: number;
      maxAttempts: number;
      attemptTimeoutSeconds: number;
      attemptFinalTimeoutSeconds: number;
    }) => {
      const res = await api('/init-create-puzzle', input);
      return res as {
        tx: string;
        avatarUrl: string;
        fileName: string | null;
        puzzlePDA: string;
        blockhashWithExpiryBlockHeight: {
          blockhash: string;
          lastValidBlockHeight: number;
        };
        commitment: string;
      };
    },
  });
}
