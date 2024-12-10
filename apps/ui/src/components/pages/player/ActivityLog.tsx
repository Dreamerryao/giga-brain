'use client';

import { Brain, Trophy, Target, ArrowRight, Clock, XIcon } from 'lucide-react';
import { useMemo } from 'react';
import * as anchor from '@coral-xyz/anchor';

import { formatRelativeTime } from '@/lib/time';
import { FormatCurrency } from '@/components/shared/FormatCurrency';

import { IActivity, Profile } from './types';

export function ActivityLog({ profile: { activities } }: { profile: Profile }) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Activity Log</h2>
        {/* <button className='text-sm text-zinc-400 hover:text-rose-400 transition-colors'>
          View All
        </button> */}
      </div>

      <div className='game-card divide-y divide-zinc-800/50'>
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: IActivity }) {
  const {
    icon: Icon,
    title,
    description,
    color,
    bg,
  } = useMemo(() => {
    const mint = new anchor.web3.PublicKey(activity.puzzle.currency_mint);
    const data = JSON.parse(activity.data) as {
      fee?: string;
      prize?: number;
      solverShare?: number;
      creatorShare?: number;
    };
    const ACTIVITY_CONFIG = {
      PuzzleCreated: {
        icon: Brain,
        title: <>Created puzzle {activity.puzzle.name}</>,
        description: (
          <>
            Initial pool funds:{' '}
            <FormatCurrency
              amount={activity.puzzle.initial_prize ?? 0}
              showValue
              mint={mint}
            />
          </>
        ),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      },
      PuzzleAttempted: {
        icon: Target,
        title: <>Agent {activity.puzzle.name}</>,
        description: (
          <>
            Attempted puzzle{' '}
            <FormatCurrency
              amount={parseInt(data.fee ?? '0', 16)}
              showValue
              mint={mint}
            />{' '}
          </>
        ),
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
      },
      PuzzleApprovedTransfer: {
        icon: Trophy,
        title: <>Agent {activity.puzzle.name}</>,
        description: <>Attempt was approved and agent was solved</>,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      },
      PuzzleRejectedTransfer: {
        icon: XIcon,
        title: <>Agent {activity.puzzle.name}</>,
        description: <>Attempt was rejected</>,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
      },
      PuzzleClaimedPrize: {
        icon: Clock,
        title: <>Agent {activity.puzzle.name}</>,
        description: (
          <>
            Claimed prize pool of solved agent{' '}
            <FormatCurrency
              amount={data.solverShare ?? 0}
              showValue
              mint={mint}
            />
          </>
        ),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      },
      PuzzleClaimedTimeOut: {
        icon: Clock,
        title: <>Agent {activity.puzzle.name}</>,
        description: (
          <>
            Claimed prize pool of timed out agent{' '}
            <FormatCurrency
              amount={data.creatorShare ?? 0}
              showValue
              mint={mint}
            />
          </>
        ),
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      },
    };

    return ACTIVITY_CONFIG[activity.event];
  }, [activity]);

  return (
    <div className='p-6 flex items-center justify-between group hover:bg-rose-500/5 transition-colors'>
      <div className='flex items-center space-x-4'>
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>

        <div>
          <h3 className='font-medium text-white'>{title}</h3>
          <p className='text-sm text-zinc-400'>{description}</p>
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <span className='text-sm text-zinc-500'>
          {formatRelativeTime(activity.created_at)}
        </span>
        <ArrowRight
          className='w-5 h-5 text-zinc-400 group-hover:text-rose-400 
                           group-hover:translate-x-1 transition-all'
        />
      </div>
    </div>
  );
}
