'use client';
import { Brain, CopyIcon, ExternalLink, Trophy } from 'lucide-react';
import { formatNumber } from '@repo/lib/src/bn';
import { useMemo } from 'react';

import { WalletAvatar } from '@/components/shared/WalletAvatar';
import { Button } from '@/components/ui/button';
import { abbrAddr } from '@/lib/string';
import { Copy } from '@/components/shared/Copy';
import { getExplorerAddressUrl } from '@/lib/explorer';
import { cn } from '@/lib/utils';

import { Profile } from './types';

export function ProfileHeader({ profile }: { profile: Profile }) {
  const rankColorClassName = useMemo(() => {
    if (profile.rank === 1) return 'text-yellow-400 bg-yellow-500/10';
    if (profile.rank === 2) return 'text-zinc-300 bg-zinc-500/10';
    if (profile.rank === 3) return 'text-amber-600 bg-amber-600/10';
    return 'text-rose-400 bg-rose-500/10';
  }, [profile.rank]);

  const earnings = useMemo(
    () => (
      <div className='flex items-center space-x-3'>
        <div className='lg:text-right'>
          <p className='text-xs lg:text-sm text-zinc-400'>Total Earnings</p>
          <p className='text-2xl font-bold text-rose-400'>
            ${formatNumber(profile.stats.total_earnings_usd, 2)}
          </p>
        </div>
        <div className='p-3 bg-rose-500/10 rounded-xl hidden lg:block'>
          <Brain className='w-6 h-6 text-rose-400' />
        </div>
      </div>
    ),
    [profile.stats.total_earnings_usd]
  );

  return (
    <div className='game-card p-8'>
      <div className='flex flex-col lg:flex-row items-start justify-between gap-4'>
        <div className='flex lg:items-center space-x-6'>
          <div className='relative'>
            <div className='absolute inset-0 bg-rose-500/20 rounded-full blur-xl hidden lg:block' />
            <WalletAvatar address={profile.address} size={80} />
          </div>

          <div className='space-y-2'>
            {/* 
            <h1 className='text-3xl font-bold'>
              {profile.name || 'Anon Player'}
            </h1> */}
            <div className='flex items-center space-x-2'>
              <code className='px-2 py-1 bg-zinc-800/50 rounded-lg text-zinc-400 text-sm'>
                {abbrAddr(profile.address)}
              </code>
              <Button
                variant='ghost'
                className='p-1.5 hover:bg-rose-500/10 text-zinc-400 hover:text-white'
              >
                <Copy text={profile.address}>
                  <CopyIcon className='w-4 h-4' />
                </Copy>
              </Button>
              <Button
                variant='ghost'
                asChild
                className='p-1.5 hover:bg-rose-500/10 text-zinc-400 hover:text-white'
              >
                <a
                  href={getExplorerAddressUrl(profile.address)}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ExternalLink className='w-4 h-4' />
                </a>
              </Button>
            </div>
            <div
              className={cn(
                'flex items-center space-x-2 px-3 py-1.5 rounded-full',
                rankColorClassName
              )}
            >
              <Trophy className='w-4 h-4' />
              <span className='text-sm font-medium'>Rank #{profile.rank}</span>
            </div>

            <div className='block lg:hidden'>{earnings}</div>
          </div>
        </div>

        <div className='hidden lg:block'>{earnings}</div>
      </div>
    </div>
  );
}
