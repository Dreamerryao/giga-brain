'use client';

import { Brain } from 'lucide-react';
import { Coins, Shield } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { formatNumber } from '@repo/lib/src/bn';

import { useGameQuery } from '@/hooks/queries/useGameQuery';

export function Stats() {
  const { data } = useGameQuery();

  const stats = useMemo(() => {
    return [
      {
        title: 'Agents Created',
        value: data?.total_puzzles_created ?? 0,
        icon: Shield,
      },
      {
        title: 'Total Prize Pool',
        value: `$${formatNumber(data?.total_active_puzzles_funds_usd ?? 0, 2)}`,
        icon: Coins,
      },
      {
        title: 'Total Attempts',
        value: data?.total_attempts_made ?? 0,
        icon: Brain,
      },
    ];
  }, [data]);

  return (
    <>
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: ReactNode;
  icon: React.ElementType;
}) {
  return (
    <div className='game-card bg-zinc-900 border border-zinc-800 rounded-lg p-6'>
      <div className='flex items-center gap-4'>
        <div className='p-3 bg-rose-500/10 rounded-lg'>
          <Icon className='w-6 h-6 text-rose-500' />
        </div>
        <div>
          <p className='text-sm text-zinc-400'>{title}</p>
          <p className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600'>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
