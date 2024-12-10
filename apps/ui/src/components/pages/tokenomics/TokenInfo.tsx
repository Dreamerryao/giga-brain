import React from 'react';
import { Rocket } from 'lucide-react';

export function TokenInfo() {
  return (
    <div className='game-card p-6 space-y-6'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <Rocket className='w-6 h-6 text-rose-500' />
        </div>
        <h3 className='text-xl font-bold'>Token Launch</h3>
      </div>

      <div className='space-y-4'>
        <div className='bg-zinc-800/50 rounded-xl p-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-zinc-400'>Launch Date</p>
              <p className='text-lg font-bold text-white'>December 21, 2024</p>
            </div>
            <div>
              <p className='text-sm text-zinc-400'>Launch Time</p>
              <p className='text-lg font-bold text-white'>6:28:24 PM UTC</p>
            </div>
          </div>
        </div>

        <div className='bg-zinc-800/50 rounded-xl p-4'>
          <p className='text-sm text-zinc-400'>Platform</p>
          <p className='text-lg font-bold text-white'>PumpFun</p>
        </div>
      </div>
    </div>
  );
}
