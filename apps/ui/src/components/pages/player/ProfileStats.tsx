import React, { PropsWithChildren } from 'react';
import { Brain, Trophy, Target, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Profile } from './types';

export function ProfileStats({ profile: { stats } }: { profile: Profile }) {
  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Statistics</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard icon={Brain} label='Agents Created'>
          {stats.total_puzzles_created}
        </StatCard>
        <StatCard icon={Trophy} label='Agents Solved'>
          {stats.total_puzzles_solved}
        </StatCard>
        <StatCard icon={Target} label='Total Attempts'>
          {stats.total_attempts_made}
        </StatCard>
        <StatCard icon={Zap} label='Agents Successfully Timed Out'>
          {stats.total_puzzles_timed_out}
        </StatCard>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  change?: number;
}

function StatCard({
  icon: Icon,
  label,
  children,
  change,
}: PropsWithChildren<StatCardProps>) {
  return (
    <div className='game-card p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <Icon className='w-5 h-5 text-rose-400' />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'text-sm font-medium px-2 py-1 rounded-full',
              change > 0
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-rose-400 bg-rose-500/10'
            )}
          >
            {change > 0 ? '+' : ''}
            {change}%
          </div>
        )}
      </div>
      <div>
        <p className='text-sm text-zinc-400'>{label}</p>
        <p className='text-2xl font-bold text-white'>{children}</p>
      </div>
    </div>
  );
}
