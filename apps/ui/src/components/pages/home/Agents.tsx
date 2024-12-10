'use client';

import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { Brain, Clock, Coins } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getAgentRoute } from '@/lib/routes';
import {
  useHomeAgentsQuery,
  type HomeAgent,
} from '@/hooks/queries/useHomeAgentsQuery';
import { WalletAvatar } from '@/components/shared/WalletAvatar';
import { PuzzleRemainingTime } from '@/components/shared/PuzzleRemainingTime';
import { TruncatedText } from '@/components/shared/TruncatedText';
import { abbrAddr } from '@/lib/string';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { getPuzzleETA } from '@/hooks/usePuzzleETA';
import { Loader } from '@/components/shared/Loader';

type SortBy = 'funds' | 'recent' | 'oldest';
type FilterBy = 'Active' | 'TimedOut' | 'Completed';

export function Agents() {
  const { data: agents } = useHomeAgentsQuery();

  const searchParams = useSearchParams();
  const router = useRouter();

  const { sortBy, filterBy } = useMemo(() => {
    return {
      sortBy: (searchParams.get('sortBy') as SortBy) || 'recent',
      filterBy: (searchParams.get('filterBy') as FilterBy) || 'Active',
    };
  }, [searchParams]);

  const setSearchParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const sortedAgents = useMemo(() => {
    return !agents
      ? null
      : [...agents]
          .filter((a) => filterAgent(a, filterBy))
          .sort((a: HomeAgent, b: HomeAgent) => {
            switch (sortBy) {
              case 'funds':
                return b.total_funds_usd - a.total_funds_usd;
              case 'recent':
                return (
                  toUnixTimestamp(b.created_at) - toUnixTimestamp(a.created_at)
                );
              case 'oldest':
                return (
                  toUnixTimestamp(a.created_at) - toUnixTimestamp(b.created_at)
                );
            }
          });
  }, [agents, filterBy, sortBy]);

  const otherAgents = useMemo(() => {
    return !agents
      ? null
      : [...agents].filter((a) => !filterAgent(a, filterBy));
  }, [agents, filterBy]);

  return (
    <>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600'>
          {filterBy} Agents
        </h2>
        <div className='flex items-center space-x-2'>
          <select
            value={filterBy}
            onChange={(e) => setSearchParams('filterBy', e.target.value)}
            className='bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500'
          >
            <option value='Active'>Active</option>
            <option value='TimedOut'>Timed Out</option>
            <option value='Completed'>Completed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSearchParams('sortBy', e.target.value)}
            className='bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500'
          >
            <option value='recent'>Most Recent</option>
            <option value='oldest'>Oldest First</option>
            <option value='funds'>Highest Prize</option>
          </select>
        </div>
      </div>

      {!sortedAgents?.length ? (
        <>
          {!sortedAgents ? (
            <div className='flex justify-center w-full'>
              <Loader text='Loading' />
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              <div className='flex justify-center w-full'>
                No {filterBy} agents
              </div>
            </div>
          )}
        </>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {sortedAgents?.map((agent) => (
            <Link href={getAgentRoute(agent.public_key)} key={agent.public_key}>
              <AgentCard agent={agent} />
            </Link>
          ))}
        </div>
      )}

      <div>
        <h4 className='text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600 py-4'>
          Other agents
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {otherAgents?.map((agent) => (
            <Link href={getAgentRoute(agent.public_key)} key={agent.public_key}>
              <AgentCard agent={agent} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function AgentCard({ agent }: { agent: HomeAgent }) {
  return (
    <div
      className='game-card bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 cursor-pointer 
                 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1
                 hover:bg-gradient-to-br from-zinc-900 to-zinc-950
                 hover:border-rose-500/20 group/card'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='relative'>
            <div className='absolute inset-0 bg-rose-500/20 rounded-full blur-md float-animation' />
            {agent.avatar_url ? (
              <img
                src={agent.avatar_url}
                alt={agent.name ?? ''}
                className='relative w-8 rounded-full '
              />
            ) : (
              <WalletAvatar address={agent.creator} />
            )}
          </div>
          <div>
            <h3 className='font-bold text-white text-lg group-hover/card:text-rose-400 transition-colors'>
              {agent.name}
            </h3>
            <p className='hidden'>
              <TruncatedText text={agent.prompt} maxLength={20} />
            </p>
            <p className='text-sm text-zinc-400'>
              by {abbrAddr(agent.creator)}
            </p>
          </div>
        </div>
        <div className='cyber-border p-2'>
          <div className='flex items-center space-x-2 text-zinc-300'>
            <Clock className='w-4 h-4 text-rose-400' />
            <span className='text-sm '>
              <PuzzleRemainingTime agent={agent} />
            </span>
          </div>
        </div>
      </div>

      <div className='space-y-3 py-2'>
        <div className='flex items-center space-x-2'>
          <div className='p-2 bg-rose-500/10 rounded-lg'>
            <Coins className='w-5 h-5 text-rose-400' />
          </div>
          <span className='font-bold text-xl text-white group-hover/card:text-rose-400 transition-colors'>
            <FormatCurrency amount={agent.total_funds} mint={agent.mint} />
          </span>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-zinc-800/50 rounded-lg p-3 group-hover/card:bg-zinc-800/70 transition-colors'>
            <p className='text-sm text-zinc-400'>Current Fee</p>
            <p className='text-rose-400 '>
              <FormatCurrency amount={agent.current_fee} mint={agent.mint} />
            </p>
          </div>
          <div className='bg-zinc-800/50 rounded-lg p-3 group-hover/card:bg-zinc-800/70 transition-colors'>
            <p className='text-sm text-zinc-400'>Attempts</p>
            <p className='text-rose-400 '>{agent.total_attempts_made}</p>
          </div>
        </div>
      </div>

      <Button
        className='game-button w-full group rounded-2xl opacity-90 group-hover/card:opacity-100 
                   group-hover/card:scale-[1.02] transition-all duration-300'
      >
        <span className='relative z-10 flex items-center justify-center'>
          Challenge Agent
          <Brain className='w-4 h-4 ml-2 group-hover:rotate-12 transition-transform' />
        </span>
      </Button>
    </div>
  );
}

function toUnixTimestamp(date: string) {
  return new Date(date).getTime() / 1000;
}

function filterAgent(agent: HomeAgent, filterBy: FilterBy) {
  const { status } = getPuzzleETA(agent);
  switch (filterBy) {
    case 'Active':
      return status === 'Active' || status === 'Created';
    case 'Completed':
      return status === 'Completed';
    default:
      return status === 'TimedOut';
  }
}
