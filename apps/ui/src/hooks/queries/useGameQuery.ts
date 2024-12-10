import { useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/lib/src/supabase';

import { Tables } from '@/lib/db-types';

export type Game = {
  puzzle_attempt_timeout_seconds: Tables<'game'>['puzzle_attempt_timeout_seconds'];
  puzzle_attempt_final_timeout_seconds: Tables<'game'>['puzzle_attempt_final_timeout_seconds'];
  max_attempts: Tables<'game'>['max_attempts'];
  total_puzzles_created: Tables<'game'>['total_puzzles_created'];
  total_puzzles_solved: Tables<'game'>['total_puzzles_solved'];
  total_attempts_made: Tables<'game'>['total_attempts_made'];
  sol_price: Tables<'game'>['sol_price'];
  giga_price: Tables<'game'>['giga_price'];
  giga_market_cap: Tables<'game'>['giga_market_cap'];
  giga_volume_24h: Tables<'game'>['giga_volume_24h'];
  giga_circulating_supply: Tables<'game'>['giga_circulating_supply'];
  total_active_puzzles_funds_usd: Tables<'game'>['total_active_puzzles_funds_usd'];
};

export function useGameQuery() {
  return useQuery({
    queryKey: ['useGameQuery'],
    queryFn: async () => {
      const { data } = await supabase
        .from('game')
        .select(
          `
            puzzle_attempt_timeout_seconds,
            puzzle_attempt_final_timeout_seconds,
            max_attempts,
            total_puzzles_created,
            total_puzzles_solved,
            total_attempts_made,
            sol_price,
            giga_price,
            giga_market_cap,
            giga_volume_24h,
            giga_circulating_supply,
            total_active_puzzles_funds_usd
          `
        )
        .limit(100);
      if (!data) return null;
      const game: Game = data[0];
      return {
        ...game,
        total_active_agents:
          game.total_puzzles_created - game.total_puzzles_solved,
        total_attempts_made: game.total_attempts_made,
      };
    },
  });
}
