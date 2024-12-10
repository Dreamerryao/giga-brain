import React from 'react';
import { Lock } from 'lucide-react';

export function WeeklyBurn() {
  return (
    <div className='game-card p-6 space-y-6'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <Lock className='w-6 h-6 text-rose-500' />
        </div>
        <h3 className='text-xl font-bold'>Weekly Protocol Burns</h3>
      </div>

      <div className='bg-zinc-800/50 rounded-xl p-4'>
        <div className='space-y-4'>
          <div>
            <p className='text-sm text-zinc-400'>Weekly Burn Rate</p>
            <p className='text-3xl font-bold text-rose-400'>30%</p>
            <p className='text-sm text-zinc-400 mt-2'>of protocol fees</p>
          </div>
          <p className='text-sm text-zinc-400'>
            Every week, 30% of accumulated protocol fees are used to buy and
            burn tokens, continuously reducing supply and adding value
          </p>
        </div>
      </div>
    </div>
  );
}
