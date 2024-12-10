import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

export function useClaimPrizeMutation() {
  return useMutation({
    mutationFn: async (input: { puzzlePDA: string }) => {
      const res = await api('/claim-prize', input);
      return res as { tx: string };
    },
  });
}
