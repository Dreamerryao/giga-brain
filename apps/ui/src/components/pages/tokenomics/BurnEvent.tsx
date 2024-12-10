import React from 'react';
import { Flame } from 'lucide-react';

export function BurnEvent() {
  return (
    <div className='game-card p-6 space-y-6'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <Flame className='w-6 h-6 text-rose-500' />
        </div>
        <h3 className='text-xl font-bold'>Initial Burn Event</h3>
      </div>

      <div className='bg-zinc-800/50 rounded-xl p-4'>
        <div className='space-y-4'>
          <div>
            <p className='text-sm text-zinc-400'>Dev Allocation Burned</p>
            <p className='text-3xl font-bold text-rose-400'>45%</p>
          </div>
          <p className='text-sm text-zinc-400'>
            The development team demonstrated their commitment to the community
            by burning their entire token allocation
          </p>
        </div>
      </div>
    </div>
  );
}
