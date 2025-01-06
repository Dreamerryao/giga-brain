'use client';

import { PropsWithChildren } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Clock, Coins, LucideIcon } from 'lucide-react';

import { PuzzleRemainingTime } from '@/components/shared/PuzzleRemainingTime';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { cn } from '@/lib/utils';

import { useAgentPage } from './AgentPageProvider';

export function AgentInfo() {
  const { agent, mint, isInFinalTimer } = useAgentPage();

  return (
    <>
      <Card
        className={cn(' border-zinc-700/50 ', {
          'bg-amber-600/10 border-amber-600/20': isInFinalTimer,
        })}
        icon={Clock}
        iconClassName={cn('text-rose-400', {
          'text-amber-600': isInFinalTimer,
        })}
        label={isInFinalTimer ? 'Final Timer' : 'Normal Timer'}
      >
        <PuzzleRemainingTime agent={agent} />
      </Card>

      <div className='flex gap-2 items-center h-full'>
        <FeeCard fee={agent.current_fee} mint={mint} label='Current Fee' />
        <FeeCard
          fee={agent.initial_prize + agent.total_fees_paid}
          mint={mint}
          label='Pool'
        />
      </div>
    </>
  );
}

function FeeCard({
  fee,
  mint,
  label,
}: {
  fee: number;
  mint: anchor.web3.PublicKey;
  label: string;
}) {
  return (
    <Card
      icon={Coins}
      label={label}
      className='bg-rose-500/10 border-rose-500/20'
    >
      <FormatCurrency amount={fee} mint={mint} />
    </Card>
  );
}

function Card({
  label,
  children,
  icon: Icon,
  className,
  iconClassName,
}: PropsWithChildren<{
  label: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}>) {
  return (
    <div
      className={cn(
        'flex items-center space-x-2 px-4 h-full rounded-xl border leading-none',
        className
      )}
    >
      <Icon className={cn('w-5 h-5 text-rose-400', iconClassName)} />
      <div className=' text-zinc-300 flex flex-col leading-none lg:leading-tight lg:gap-1'>
        <span className='text-[10px] text-zinc-400'>{label}</span>
        {children}
      </div>
    </div>
  );
}
