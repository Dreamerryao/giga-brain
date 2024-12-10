'use client';

import { Clock, Coins } from 'lucide-react';

import { PuzzleRemainingTime } from '@/components/shared/PuzzleRemainingTime';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { cn } from '@/lib/utils';

import { useAgentPage } from './AgentPageProvider';

export function AgentInfo() {
  const { agent, mint, isInFinalTimer } = useAgentPage();

  return (
    <>
      <div
        className={cn(
          'flex items-center space-x-2 px-4 h-full rounded-xl border border-zinc-700/50 leading-none',
          {
            'bg-amber-600/10 border-amber-600/20': isInFinalTimer,
          }
        )}
      >
        <Clock
          className={cn('w-5 h-5 text-rose-400', {
            'text-amber-600': isInFinalTimer,
          })}
        />
        <div className=' text-zinc-300 flex flex-col leading-none lg:leading-tight lg:gap-1'>
          <span className='text-[10px] text-zinc-400'>
            {isInFinalTimer ? 'Final Timer' : 'Normal Timer'}
          </span>
          <PuzzleRemainingTime agent={agent} />
        </div>
      </div>

      <div className='flex items-center space-x-2 bg-rose-500/10 px-4 h-full rounded-xl border border-rose-500/20'>
        <Coins className='w-5 h-5 text-rose-400' />
        <span className=' font-bold text-white'>
          <FormatCurrency
            amount={agent.initial_prize + agent.total_fees_paid}
            mint={mint}
          />
        </span>
      </div>
    </>
  );
}
