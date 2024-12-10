'use client';

import { Award, Medal, Brain, Sparkles, Crown } from 'lucide-react';
import Link from 'next/link';
import { formatNumber } from '@repo/lib/src/bn';

import { cn } from '@/lib/utils';
import {
  LeaderboardPlayer,
  useLeaderboardQuery,
} from '@/hooks/queries/useLeaderboardQuery';
import { abbrAddr } from '@/lib/string';
import { WalletAvatar } from '@/components/shared/WalletAvatar';
import { getPlayerRoute } from '@/lib/routes';

const PODIUM = [
  {
    icon: Crown,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    label: '🏆 Champion',
    position: 'P1',
    glow: 'shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]',
  },
  {
    icon: Award,
    color: 'text-zinc-300',
    bg: 'bg-zinc-300/20',
    border: 'border-zinc-300/30',
    label: '🥈 Runner Up',
    position: 'P2',
    glow: 'shadow-[0_0_30px_-5px_rgba(161,161,170,0.3)]',
  },
  {
    icon: Medal,
    color: 'text-amber-600',
    bg: 'bg-amber-600/20',
    border: 'border-amber-600/30',
    label: '🥉 Third Place',
    position: 'P3',
    glow: 'shadow-[0_0_30px_-5px_rgba(217,119,6,0.3)]',
  },
];

export function LeaderboardPodium() {
  const { data } = useLeaderboardQuery();

  return (
    <>
      {PODIUM.map((podium, index) => {
        const player = data?.[index];
        return !player ? null : (
          <PodiumPosition
            key={player.public_key}
            player={player}
            index={index}
            podium={podium}
          />
        );
      })}
    </>
  );
}

function PodiumPosition({
  player,
  index,
  podium: { icon: BadgeIcon, ...badge },
}: {
  player: LeaderboardPlayer;
  index: number;
  podium: (typeof PODIUM)[number];
}) {
  return (
    <Link href={getPlayerRoute(player.public_key)} key={player.public_key}>
      <div
        className={cn(
          'game-card relative overflow-hidden',
          index === 0 && 'md:order-2 md:transform md:-translate-y-12 z-20',
          index === 1 && 'md:order-1 md:transform md:-translate-y-6 z-10',
          index === 2 && 'md:order-3 md:transform md:-translate-y-6 z-0',
          badge.glow
        )}
      >
        {/* Racing Number */}
        <div className='absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-rose-500/20 to-transparent rounded-full flex items-end justify-start p-4 opacity-50'>
          <span className='font-bold text-4xl text-rose-500/50 '>
            {badge.position}
          </span>
        </div>

        <div className='p-6 space-y-6'>
          {/* Position Badge */}
          <div className='inline-flex items-center space-x-2 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20'>
            <BadgeIcon className={cn('w-4 h-4', badge.color)} />
            <span className={cn('text-sm font-medium', badge.color)}>
              {badge.label}
            </span>
          </div>

          {/* User Info */}
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <div
                className={cn(
                  'absolute inset-0 rounded-full blur-xl',
                  badge.bg
                )}
              />
              <WalletAvatar address={player.public_key} size={64} />
            </div>
            <div>
              <h3 className='text-xl font-bold text-white'>
                {abbrAddr(player.public_key)}
              </h3>
              <div className='flex items-center space-x-2 mt-1'>
                <Brain className='w-4 h-4 text-rose-400' />
                <span className='text-rose-400 font-medium'>
                  {formatNumber(player.total_earnings_usd, 2)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-zinc-800/50 rounded-xl p-3'>
              <p className='text-sm text-zinc-400'>
                Agents <br />
                Timed Out &amp; Solved
              </p>
              <p className='text-lg font-bold text-white'>
                {player.total_puzzles_timed_out_or_solved}
              </p>
            </div>
            <div className='bg-zinc-800/50 rounded-xl p-3'>
              <p className='text-sm text-zinc-400'>Earnings</p>
              <p className='text-lg font-bold text-white'>
                ${formatNumber(player.total_earnings_usd, 2)}
              </p>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className='flex justify-center space-x-2'>
            {Array.from({
              length: Math.min(player.total_puzzles_timed_out_or_solved, 5),
            }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'p-1.5 rounded-lg',
                  badge.bg,
                  'transform hover:scale-110 transition-transform'
                )}
              >
                <Sparkles className={cn('w-4 h-4', badge.color)} />
              </div>
            ))}
          </div>
        </div>

        {/* Racing Stripe */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-1',
            index === 0 && 'bg-yellow-500/50',
            index === 1 && 'bg-zinc-300/50',
            index === 2 && 'bg-amber-600/50'
          )}
        />
      </div>
    </Link>
  );
}
