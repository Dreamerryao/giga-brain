'use client';
import React from 'react';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  CircleDollarSignIcon,
} from 'lucide-react';
import { formatNumber } from '@repo/lib/src/bn';

import { useGameQuery } from '@/hooks/queries/useGameQuery';

interface MarketMetricProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

function MarketMetric({ label, value, icon: Icon }: MarketMetricProps) {
  return (
    <div className='bg-zinc-800/50 rounded-xl p-4'>
      <div className='flex items-center space-x-3 mb-2'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <Icon className='w-4 h-4 text-rose-400' />
        </div>
        <span className='text-sm text-zinc-400'>{label}</span>
      </div>
      <p className='text-xl font-bold text-white'>{value}</p>
    </div>
  );
}

export function MarketData() {
  const { data: game } = useGameQuery();

  return (
    <div className='game-card p-6 space-y-6'>
      <h3 className='text-xl font-bold'>Market Data</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <MarketMetric
          label='Price'
          value={formatNumber(game?.giga_price ?? 0, 8)}
          icon={DollarSign}
        />
        <MarketMetric
          label='Circulating Supply'
          value={formatNumber(game?.giga_circulating_supply ?? 0)}
          icon={CircleDollarSignIcon}
        />
        <MarketMetric
          label='Market Cap'
          value={formatNumber(game?.giga_market_cap ?? 0)}
          icon={TrendingUp}
        />
        <MarketMetric
          label='24h Volume'
          value={formatNumber(game?.giga_volume_24h ?? 0)}
          icon={BarChart3}
        />
      </div>
    </div>
  );
}
