import React from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface RoadmapEventProps {
  date: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isActive?: boolean;
}

export function RoadmapEvent({
  date,
  title,
  description,
  icon: Icon,
  isActive,
}: RoadmapEventProps) {
  return (
    <div className='relative flex gap-6'>
      <div className='flex flex-col items-center'>
        <div
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full border',
            isActive
              ? 'bg-rose-500/10 border-rose-500/20'
              : 'bg-zinc-800/50 border-zinc-700/50'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              isActive ? 'text-rose-400' : 'text-zinc-400'
            )}
          />
        </div>
        <div className='flex-1 w-px bg-zinc-800 my-4' />
      </div>
      <div className='flex-1 pb-12'>
        <div className='game-card p-6 space-y-4'>
          <span
            className={cn(
              'text-sm font-medium',
              isActive ? 'text-rose-400' : 'text-zinc-400'
            )}
          >
            {date}
          </span>
          <h3 className='text-xl font-bold'>{title}</h3>
          <p className='text-zinc-400'>{description}</p>
        </div>
      </div>
    </div>
  );
}
