import BigNumber from 'bignumber.js';
import * as anchor from '@coral-xyz/anchor';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useSolanaConnection } from '@/providers/solana/connection';

export const SOL_BALANCE_QUERY_KEYS = ['useSOLBalanceQuery'];

export function useSOLBalanceQuery(pubKey: anchor.web3.PublicKey | null) {
  const connection = useSolanaConnection();
  const enabled = !!pubKey;

  const { data: balance, refetch } = useQuery({
    queryKey: SOL_BALANCE_QUERY_KEYS.concat([pubKey?.toString() ?? '-']),
    queryFn: async () => {
      if (!enabled) return null;
      const balance = await connection.getBalance(pubKey);
      return new BigNumber(balance.toString());
    },
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    const unsubs = [() => {}];
    const sid = connection.onAccountChange(pubKey, () => {
      setTimeout(refetch, 1000);
    });
    unsubs.push(() => {
      connection.removeAccountChangeListener(sid);
    });
    return () => unsubs.forEach((unsub) => unsub());
  }, [connection, pubKey, refetch, enabled]);

  return balance ?? new BigNumber(0);
}
