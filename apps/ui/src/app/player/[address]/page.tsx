import React from 'react';
import { supabase } from '@repo/lib/src/supabase';

import { ProfileHeader } from '@/components/pages/player/ProfileHeader';
import { ProfileStats } from '@/components/pages/player/ProfileStats';
import { ActivityLog } from '@/components/pages/player/ActivityLog';
import { PageLayout } from '@/components/shared/PageLayout';
import { Profile } from '@/components/pages/player/types';

export default async function ProfilePage({
  params: { address },
}: {
  params: { address: string };
}) {
  const profile = await getPlayerProfile(address);

  return (
    <PageLayout>
      <div className='space-y-8'>
        <ProfileHeader profile={profile} />
        <ProfileStats profile={profile} />
        <ActivityLog profile={profile} />
      </div>
    </PageLayout>
  );
}

async function getPlayerProfile(address: string): Promise<Profile> {
  const { data: stats } = await supabase
    .from('player_activity')
    .select(
      `
        public_key,
        total_puzzles_created,
        total_attempts_made,
        total_puzzles_solved,
        total_puzzles_timed_out,
        total_earnings_usd
      `
    )
    .eq('public_key', address);

  const { data: activitiesData } = await supabase
    .from('player_activity_log')
    .select(
      `
        id,
        event,
        puzzle!inner (
          name,
          model,
          initial_prize,
          currency_mint
        ),
        created_at,
        data
      `
    )
    .eq('player', address)
    .order('created_at', { ascending: false })
    .limit(100);

  const total_earnings_usd = stats?.[0]?.total_earnings_usd || 0;

  // Get all players with higher earnings
  const rank =
    (
      await supabase
        .from('player_activity')
        .select('*', { count: 'exact', head: true })
        .gte('total_earnings_usd', total_earnings_usd)
    ).count ?? 0;

  const activities =
    activitiesData?.map((activity) => ({
      ...activity,
      puzzle: {
        // @ts-expect-error TODO: fix this
        name: activity.puzzle.name,
        // @ts-expect-error TODO: fix this
        model: activity.puzzle.model,
        // @ts-expect-error TODO: fix this
        initial_prize: activity.puzzle.initial_prize,
        // @ts-expect-error TODO: fix this
        currency_mint: activity.puzzle.currency_mint,
      },
    })) || [];

  return {
    address,
    stats: stats?.[0] || {
      total_puzzles_created: 0,
      total_attempts_made: 0,
      total_puzzles_solved: 0,
      total_puzzles_timed_out: 0,
      total_earnings_usd: 0,
    },
    activities,
    rank,
  };
}
