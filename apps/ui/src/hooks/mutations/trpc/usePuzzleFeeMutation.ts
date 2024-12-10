import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

export function usePuzzleFeeMutation() {
  return useMutation({
    mutationFn: async (input: { puzzlePDA: string }) => {
      const res = await api('/puzzle-fee', input);
      return res as {
        fee: number;
      };
    },
  });
}
