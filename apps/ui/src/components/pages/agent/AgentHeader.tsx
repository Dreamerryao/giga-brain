'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Brain,
  Coins,
  CopyIcon,
  TimerIcon,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getHomeRoute, getPlayerRoute } from '@/lib/routes';
import { WalletAvatar } from '@/components/shared/WalletAvatar';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { TruncatedText } from '@/components/shared/TruncatedText';
import { abbrAddr } from '@/lib/string';
import { useUI } from '@/providers/ui';
import { Copy } from '@/components/shared/Copy';

import { useAgentPage } from './AgentPageProvider';
import { AgentInfo } from './AgentInfo';
import { ChatModeToggle } from './ChatModeToggle';

export function AgentHeader() {
  const { agent, mint } = useAgentPage();
  const {
    mediaQueries: { isMD },
  } = useUI();

  const [isExpanded, setIsExpanded] = useState(false);

  const stats = useMemo(
    () => [
      [
        {
          title: 'Total Attempts',
          value: agent.total_attempts_made,
          icon: Brain,
        },
        {
          title: 'Current Fee',
          value: <FormatCurrency amount={agent.current_fee} mint={mint} />,
          icon: Coins,
        },
      ],
      [
        {
          title: 'Normal Timer',
          value: `${Math.floor(agent.attempt_timeout_seconds / 60 / 60)}h`,
          icon: TimerIcon,
        },
        {
          title: 'Last Timer',
          value: `${Math.floor(agent.attempt_final_timeout_seconds / 60 / 60)}h`,
          icon: TimerIcon,
        },
        {
          title: 'Max Attempts Before Final Timer',
          value: agent.max_attempts,
          icon: Brain,
        },
      ],
    ],
    [agent, mint]
  );

  return (
    <div className='glass-panel rounded-t-3xl border-b-0 absolute top-[72px] lg:top-24 left-0 right-0 z-10'>
      {/* Main Header Row */}
      <div className='flex flex-col gap-2'>
        <div className='p-2 flex items-center justify-between'>
          <div className='flex items-center lg:space-x-6'>
            <Link href={getHomeRoute()}>
              <Button
                variant='ghost'
                className='hover:bg-rose-500/10 hover:text-white p-2 lg:px-4'
              >
                <ArrowLeft className='w-6 h-6' />
              </Button>
            </Link>

            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <div className='absolute inset-0 bg-rose-500/20 rounded-full blur-lg pulse-animation' />
                {agent.avatar_url ? (
                  <img
                    src={agent.avatar_url}
                    alt={agent.name ?? ''}
                    className='relative w-12 h-12 rounded-full '
                  />
                ) : (
                  <WalletAvatar address={agent.creator} size={36} />
                )}
              </div>
              <div>
                <h1 className='text-lg md:text-2xl font-bold text-white flex items-center gap-2'>
                  {agent.name}
                </h1>
                <p className='text-sm text-zinc-400'>
                  Created by{' '}
                  <Link
                    href={getPlayerRoute(agent.creator)}
                    className='underline'
                  >
                    {abbrAddr(agent.creator)}
                  </Link>
                </p>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-white'>model:</span>
                  <span className='text-xs text-zinc-400'>{agent.model}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center space-x-6 h-12'>
            <div className='hidden md:flex items-center space-x-2 h-full'>
              <AgentInfo />
            </div>

            <Button
              variant='ghost'
              onClick={() => setIsExpanded(!isExpanded)}
              className='bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-rose-500/10 h-full rounded-xl p-0 lg:px-4 size-8 lg:size-12'
            >
              {isExpanded ? (
                <ChevronUp className='size-5' />
              ) : (
                <ChevronDown className='size-5' />
              )}
            </Button>
          </div>
        </div>

        {!isExpanded && (
          <div className='hidden lg:flex items-center px-12 pb-2'>
            <p>
              <TruncatedText text={agent.prompt} maxLength={isMD ? 150 : 50} />{' '}
              <span
                className='text-sm text-zinc-400 cursor-pointer'
                onClick={() => setIsExpanded(true)}
              >
                Read more
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className='p-2 lg:px-6 lg:pb-6 space-y-2 lg:space-y-6 animate-in slide-in-from-top duration-300'>
          <div className='space-y-3'>
            <h2 className='text-lg font-medium text-zinc-300'>System Prompt</h2>
            <div className='bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50 relative'>
              <div className='absolute top-1 right-2 lg:top-2 lg:right-4 opacity-50 hover:opacity-100 transition-opacity duration-300'>
                <Copy text={agent.prompt}>
                  <CopyIcon className='w-4 h-4' />
                </Copy>
              </div>
              <pre className='text-zinc-300 whitespace-pre-wrap  text-sm leading-relaxed max-h-[200px] overflow-y-auto'>
                {agent.prompt}
              </pre>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-2 lg:gap-4'>
            {stats.map((s, index) => (
              <div className='glass-panel p-4 flex flex-col' key={index}>
                {s.map(({ title, value, icon: Icon }) => (
                  <div className='flex flex-row justify-between' key={title}>
                    <div className='flex md:items-center md:space-x-3 md:mb-2'>
                      <div className='p-2 bg-rose-500/10 rounded-lg hidden md:block'>
                        <Icon className='w-5 h-5 text-rose-400' />
                      </div>
                      <span className='text-sm text-zinc-400'>{title}</span>
                    </div>
                    <p className='text-lg md:text-2xl font-bold text-white text-right'>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <ChatModeToggle />
    </div>
  );
}
