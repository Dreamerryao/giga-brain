import React from 'react';
import { Users } from 'lucide-react';

export function TokenDistribution() {
  return (
    <div className='game-card p-6 space-y-6'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <Users className='w-6 h-6 text-rose-500' />
        </div>
        <h3 className='text-xl font-bold'>Token Distribution</h3>
      </div>

      <div className='space-y-4'>
        <div className='bg-zinc-800/50 rounded-xl p-4'>
          <p className='text-sm text-zinc-400 mb-2'>Current Distribution</p>
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-zinc-400'>Community</span>
              <span className='text-rose-400 font-bold'>100%</span>
            </div>
            <div className='w-full bg-zinc-700 rounded-full h-2'>
              <div className='bg-rose-500 h-2 rounded-full w-full' />
            </div>
          </div>
        </div>

        <p className='text-sm text-zinc-400'>
          After the initial dev allocation burn of 45%, the token is now fully
          owned by the community
        </p>
      </div>
    </div>
  );
}
