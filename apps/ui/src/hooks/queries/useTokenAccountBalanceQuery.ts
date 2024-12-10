import { useEffect } from 'react';
import * as anchor from '@coral-xyz/anchor';
import BigNumber from 'bignumber.js';
import { useQuery } from '@tanstack/react-query';
import { toBigNumber } from '@repo/lib/src/bn';

import { useSolanaConnection } from '@/providers/solana/connection';

export const TOKEN_ACCOUNT_BALANCE_QUERY_KEYS = ['useTokenAccountBalanceQuery'];

export function useTokenAccountBalanceQuery(
  pubKey: anchor.web3.PublicKey | null
) {
  const connection = useSolanaConnection();
  const enabled = !!pubKey;

  const { data: balance, refetch } = useQuery({
    queryKey: TOKEN_ACCOUNT_BALANCE_QUERY_KEYS.concat([
      pubKey?.toString() ?? '-',
    ]),
    queryFn: async () => {
      if (!enabled) return null;
      let account,
        balance = toBigNumber(0);
      if (connection && pubKey) {
        try {
          account = await connection.getTokenAccountBalance(pubKey);
        } catch (e) {
          console.warn('', pubKey.toString(), e);
        }
      }
      if (account) {
        balance = toBigNumber(account.value.amount.toString());
      }
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
