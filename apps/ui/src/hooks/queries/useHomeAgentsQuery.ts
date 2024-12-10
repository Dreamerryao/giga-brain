import { useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/lib/src/supabase';
import * as anchor from '@coral-xyz/anchor';
import { toBigNumber } from '@repo/lib/src/bn';

import { Tables } from '@/lib/db-types';
import { GIGA_MINT } from '@/config';

import { useGameQuery } from './useGameQuery';

type Agent = {
  public_key: Tables<'puzzle'>['public_key'];
  name: Tables<'puzzle'>['name'];
  avatar_url: Tables<'puzzle'>['avatar_url'];
  prompt: Tables<'puzzle'>['prompt'];
  total_attempts_made: Tables<'puzzle'>['total_attempts_made'];
  initial_prize: Tables<'puzzle'>['initial_prize'];
  created_at: Tables<'puzzle'>['created_at'];
  creator: Tables<'puzzle'>['creator'];
  current_fee: Tables<'puzzle'>['current_fee'];
  currency_mint: Tables<'puzzle'>['currency_mint'];
  last_resolved_at: Tables<'puzzle'>['last_resolved_at'];
  solved_at: Tables<'puzzle'>['solved_at'];
  status: Tables<'puzzle'>['status'];
  attempt_timeout_seconds: Tables<'puzzle'>['attempt_timeout_seconds'];
  attempt_final_timeout_seconds: Tables<'puzzle'>['attempt_final_timeout_seconds'];
  total_fees_paid: Tables<'puzzle'>['total_fees_paid'];
  final_timer_start_at: Tables<'puzzle'>['final_timer_start_at'];
};

export type HomeAgent = Agent & {
  mint: anchor.web3.PublicKey;
  total_funds: number;
  total_funds_usd: number;
};

export function useHomeAgentsQuery() {
  const { data: game } = useGameQuery();

  return useQuery({
    queryKey: ['useHomeAgentsQuery', game],
    queryFn: async (): Promise<HomeAgent[] | null> => {
      const { data } = await supabase
        .from('puzzle')
        .select(
          `
            public_key,
            name,
            avatar_url,
            prompt,
            total_attempts_made,
            total_fees_paid,
            initial_prize,
            created_at,
            creator,
            current_fee,
            last_resolved_at,
            final_timer_start_at,
            solved_at,
            status,
            currency_mint,
            attempt_timeout_seconds,
            attempt_final_timeout_seconds
          `
        )
        .limit(100);

      if (!data) return null;
      const agents: Agent[] = data;

      return agents.map((agent) => {
        const mint = new anchor.web3.PublicKey(agent.currency_mint);
        const totalFunds = agent.initial_prize + agent.total_fees_paid;
        const price =
          (mint.equals(GIGA_MINT) ? game?.giga_price : game?.sol_price) || 0;

        return {
          ...agent,
          mint,
          total_funds: totalFunds,
          total_funds_usd: toBigNumber(totalFunds)
            .times(toBigNumber(price))
            .toNumber(),
        };
      });
    },
  });
}
