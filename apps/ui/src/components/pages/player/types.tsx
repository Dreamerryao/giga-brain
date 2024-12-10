import { Tables } from '@/lib/db-types';

export type Profile = {
  address: string;
  stats: IStat;
  activities: IActivity[];
  rank: number;
};

export type IActivity = {
  id: Tables<'player_activity_log'>['id'];
  event: Tables<'player_activity_log'>['event'];
  puzzle: {
    name: Tables<'puzzle'>['name'];
    model: Tables<'puzzle'>['model'];
    initial_prize: Tables<'puzzle'>['initial_prize'];
    currency_mint: Tables<'puzzle'>['currency_mint'];
  };
  created_at: Tables<'player_activity_log'>['created_at'];
  data: Tables<'player_activity_log'>['data'];
};

export type IStat = {
  total_puzzles_created: Tables<'player_activity'>['total_puzzles_created'];
  total_attempts_made: Tables<'player_activity'>['total_attempts_made'];
  total_puzzles_solved: Tables<'player_activity'>['total_puzzles_solved'];
  total_puzzles_timed_out: Tables<'player_activity'>['total_puzzles_timed_out'];
  total_earnings_usd: Tables<'player_activity'>['total_earnings_usd'];
};
