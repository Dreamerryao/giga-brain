import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

export function useFaucetMutation() {
  return useMutation({
    mutationFn: async (input: { pubkey: string }) => {
      await api('/faucet', input);
    },
  });
}
