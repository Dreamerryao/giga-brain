import { supabase } from '@repo/lib/src/supabase';
import { useQuery } from '@tanstack/react-query';
import * as anchor from '@coral-xyz/anchor';

import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { Tables } from '@/lib/db-types';

import { getPuzzleETA } from '../usePuzzleETA';

import { useGameQuery } from './useGameQuery';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export type PuzzleNotification = PuzzleNotificationQueryResult & {
  mint: anchor.web3.PublicKey;
};

type PuzzleNotificationQueryResult = {
  public_key: Tables<'puzzle'>['public_key'];
  status: Tables<'puzzle'>['status'];
  solved_at: Tables<'puzzle'>['solved_at'];
  solver_share: Tables<'puzzle'>['solver_share'];
  total_fees_paid: Tables<'puzzle'>['total_fees_paid'];
  initial_prize: Tables<'puzzle'>['initial_prize'];
  currency_mint: Tables<'puzzle'>['currency_mint'];
};

export function useNotificationsQuery() {
  const { data: game } = useGameQuery();
  const { publicKey } = useSolanaWallet();

  const enabled = !!publicKey && !!game;
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, game],
    queryFn: async () => {
      if (!enabled) return null;

      const publicKeyString = publicKey.toString();
      const [{ data: puzzlesWon }, { data: puzzlesCreated }] =
        await Promise.all([
          supabase
            .from('puzzle')
            .select('*')
            .eq('solver', publicKeyString)
            .eq('status', 'ApprovedTransfer')
            .order('created_at', { ascending: false }),
          supabase
            .from('puzzle')
            .select('*')
            .eq('creator', publicKeyString)
            .eq('status', 'Active')
            .order('created_at', { ascending: false }),
        ]);
      // console.log(puzzlesWon, puzzlesCreated);
      const puzzles: PuzzleNotificationQueryResult[] = [
        ...(puzzlesWon ?? []),
        ...(puzzlesCreated ?? []).filter((p) => {
          // console.log(p, game, getPuzzleETA(p, game));
          return getPuzzleETA(p).status === 'TimedOut';
        }),
      ];
      return puzzles.map((p) => ({
        ...p,
        mint: new anchor.web3.PublicKey(p.currency_mint),
      }));
    },
    enabled,
  });
}
