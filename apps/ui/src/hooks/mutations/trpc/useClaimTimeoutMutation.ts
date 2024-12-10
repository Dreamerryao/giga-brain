import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

export function useClaimTimeoutMutation() {
  return useMutation({
    mutationFn: async (input: { puzzlePDA: string }) => {
      const res = await api('/claim-timeout', input);
      return res as { tx: string };
    },
  });
}
