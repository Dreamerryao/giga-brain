'use client';

import { Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@repo/lib/src/bn';

import { useLeaderboardQuery } from '@/hooks/queries/useLeaderboardQuery';
import { WalletAvatar } from '@/components/shared/WalletAvatar';
import { abbrAddr } from '@/lib/string';
import { getPlayerRoute } from '@/lib/routes';

export function LeaderboardTable() {
  const { data } = useLeaderboardQuery();
  const router = useRouter();
  return (
    <>
      {data?.map((player, index) => (
        <tr
          key={player.public_key}
          className='hover:bg-rose-500/5 transition-colors group cursor-pointer'
          onClick={() => {
            router.push(getPlayerRoute(player.public_key));
          }}
        >
          <td className='px-6 py-4 whitespace-nowrap'>
            <span className='text-lg font-bold text-zinc-400 group-hover:text-rose-400 transition-colors'>
              #{index + 1}
            </span>
          </td>
          <td className='px-6 py-4 whitespace-nowrap'>
            <div className='flex items-center space-x-3'>
              <div className='relative'>
                <div className='absolute inset-0 bg-rose-500/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity' />
                <WalletAvatar address={player.public_key} size={40} />
              </div>
              <span className='font-medium text-white group-hover:text-rose-400 transition-colors'>
                {abbrAddr(player.public_key)}
              </span>
            </div>
          </td>
          <td className='px-6 py-4 whitespace-nowrap'>
            <div className='flex items-center space-x-2'>
              <Brain className='w-4 h-4 text-zinc-400 group-hover:text-rose-400 transition-colors' />
              <span className='text-zinc-400 group-hover:text-rose-400 transition-colors'>
                {player.total_puzzles_timed_out}
              </span>
            </div>
          </td>
          <td className='px-6 py-4 whitespace-nowrap'>
            <div className='flex items-center space-x-2'>
              <Brain className='w-4 h-4 text-zinc-400 group-hover:text-rose-400 transition-colors' />
              <span className='text-zinc-400 group-hover:text-rose-400 transition-colors'>
                {player.total_puzzles_solved}
              </span>
            </div>
          </td>
          <td className='px-6 py-4 whitespace-nowrap'>
            <span className='text-rose-400 font-medium'>
              ${formatNumber(player.total_earnings_usd, 2)}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}
