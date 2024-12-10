import { useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/lib/src/supabase';

import { Tables } from '@/lib/db-types';

export type LeaderboardPlayer = LeaderboardPlayerQueryResult & {
  total_puzzles_timed_out_or_solved: number;
};

type LeaderboardPlayerQueryResult = {
  public_key: Tables<'player_activity'>['public_key'];
  total_puzzles_created: Tables<'player_activity'>['total_puzzles_created'];
  total_attempts_made: Tables<'player_activity'>['total_attempts_made'];
  total_earnings_usd: Tables<'player_activity'>['total_earnings_usd'];
  total_puzzles_solved: Tables<'player_activity'>['total_puzzles_solved'];
  total_puzzles_timed_out: Tables<'player_activity'>['total_puzzles_timed_out'];
};

export function useLeaderboardQuery() {
  return useQuery({
    queryKey: ['useLeaderboardQuery'],
    queryFn: async (): Promise<LeaderboardPlayer[] | null> => {
      const { data } = await supabase
        .from('player_activity')
        .select(
          `
          public_key,
          total_puzzles_created,
          total_attempts_made,
          total_earnings_usd,
          total_puzzles_solved,
          total_puzzles_timed_out
        `
        )
        .limit(100)
        .order('total_earnings_usd', { ascending: false });

      if (!data) return null;
      const players: LeaderboardPlayerQueryResult[] = data;
      return players.map((player) => ({
        ...player,
        total_puzzles_timed_out_or_solved:
          player.total_puzzles_timed_out + player.total_puzzles_solved,
      }));
    },
  });
}
