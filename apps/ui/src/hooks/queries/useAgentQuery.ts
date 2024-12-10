import { useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/lib/src/supabase';
import * as anchor from '@coral-xyz/anchor';

import { Tables } from '@/lib/db-types';

type Agent = {
  name: Tables<'puzzle'>['name'];
  avatar_url: Tables<'puzzle'>['avatar_url'];
  prompt: Tables<'puzzle'>['prompt'];
  total_attempts_made: Tables<'puzzle'>['total_attempts_made'];
  total_fees_paid: Tables<'puzzle'>['total_fees_paid'];
  initial_prize: Tables<'puzzle'>['initial_prize'];
  created_at: Tables<'puzzle'>['created_at'];
  creator: Tables<'puzzle'>['creator'];
  current_fee: Tables<'puzzle'>['current_fee'];
  last_resolved_at: Tables<'puzzle'>['last_resolved_at'];
  solved_at: Tables<'puzzle'>['solved_at'];
  solver: Tables<'puzzle'>['solver'];
  solver_share: Tables<'puzzle'>['solver_share'];
  service_share: Tables<'puzzle'>['service_share'];
  status: Tables<'puzzle'>['status'];
  currency_mint: Tables<'puzzle'>['currency_mint'];
  attempt_timeout_seconds: Tables<'puzzle'>['attempt_timeout_seconds'];
  attempt_final_timeout_seconds: Tables<'puzzle'>['attempt_final_timeout_seconds'];
  model: Tables<'puzzle'>['model'];
  total_funds_usd: Tables<'puzzle'>['total_funds_usd'];
  final_timer_start_at: Tables<'puzzle'>['final_timer_start_at'];
  max_attempts: Tables<'puzzle'>['max_attempts'];
};

export type AgentPageItem = Agent & {
  mint: anchor.web3.PublicKey;
};

export const AGENT_QUERY_KEY = 'useAgentQuery';

export function useAgentQuery(pubkey: string) {
  return useQuery({
    queryKey: [AGENT_QUERY_KEY, pubkey],
    queryFn: async (): Promise<AgentPageItem | null> => {
      const { data } = await supabase
        .from('puzzle')
        .select(
          `
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
          solver,
          solved_at,
          solver_share,
          service_share,
          status,
          currency_mint,
          attempt_timeout_seconds,
          attempt_final_timeout_seconds,
          model,
          total_funds_usd,
          max_attempts
        `
        )
        .eq('public_key', pubkey)
        .limit(1);

      if (!data) return null;
      const [agent]: Agent[] = data;
      if (!agent) return null;
      return {
        ...agent,
        mint: new anchor.web3.PublicKey(agent.currency_mint),
      };
    },
    refetchInterval: 5_000,
  });
}
