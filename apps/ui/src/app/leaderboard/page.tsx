import { Trophy, Flame } from 'lucide-react';

import { PageLayout } from '@/components/shared/PageLayout';
import { LeaderboardPodium } from '@/components/pages/leaderboard/LeaderboardPodium';
import { LeaderboardTable } from '@/components/pages/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
  return (
    <PageLayout>
      <div className='space-y-12'>
        {/* Hero Section */}
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800'>
          <div className='absolute inset-0'>
            <div className='absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-20' />
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-conic from-rose-500/30 via-transparent to-transparent opacity-30 animate-spin-slow' />
          </div>
          <div className='relative px-6 py-12 sm:px-12 sm:py-16 text-center space-y-6'>
            <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full'>
              <Trophy className='w-5 h-5' />
              <span className='text-sm font-medium'>GigaBrain Champions</span>
            </div>
            <h1 className='text-4xl font-bold'>
              Top AI{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600 shine-animation'>
                Puzzle Solvers
              </span>
            </h1>
            <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
              The most brilliant minds in our ecosystem. Can you make it to the
              top?
            </p>
          </div>
        </div>

        {/* F1-Style Podium */}
        <div className='relative pt-24'>
          <div className='relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-3 md:px-12'>
            <LeaderboardPodium />
          </div>
        </div>

        {/* Rest of the leaderboard remains the same */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Full Rankings</h2>
            <div className='flex items-center space-x-2 text-zinc-400'>
              <Flame className='w-5 h-5 text-rose-400' />
              <span>Updated in real-time</span>
            </div>
          </div>

          <div className='glass-panel overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-zinc-800'>
                  <th className='px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                    Rank
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                    Player
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                    Successful Agents (Timed Out)
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                    Agents Solved
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                    Total Earnings
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-zinc-800'>
                <LeaderboardTable />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
