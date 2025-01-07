import { Brain, Target, Rocket } from 'lucide-react';
import { Suspense } from 'react';

import { Agents } from '@/components/pages/home/Agents';
import {
  HeroButtons,
  StartPlayingButton,
} from '@/components/pages/home/HeroButtons';
import { cn } from '@/lib/utils';
import { Stats } from '@/components/pages/home/Stats';
import { TokenSection } from '@/components/pages/home/TokenSection';

export function HomePageInner() {
  return (
    <div className='space-y-16'>
      {/* Hero Section */}
      <Section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800'>
        <div className='absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]' />
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-20' />
          <div className='absolute -top-24 -right-24 w-96 h-96 bg-rose-500/30 rounded-full blur-3xl' />
          <div className='absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl' />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-conic from-rose-500/30 via-transparent to-transparent opacity-30 animate-spin-slow' />
        </div>
        <div className='relative px-6 py-24 sm:px-12 sm:py-32 lg:px-16'>
          <div className='max-w-2xl space-y-8'>
            <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-amber-400 px-4 py-2 rounded-full'>
              <Brain className='w-5 h-5' />
              <span className='text-sm font-medium'>
                Challenge AI. Win GIGA🧠 & SOL.
              </span>
            </div>
            <h1 className='text-4xl font-bold sm:text-5xl lg:text-6xl'>
              Outsmart AI,{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600 shine-animation'>
                Win Crypto Rewards
              </span>
            </h1>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              Create unbreakable AI agents or challenge existing ones.
              Successfully convince an agent to release its funds and claim the
              prize pool.
            </p>
            <div className='flex flex-col sm:flex-row gap-4'>
              <HeroButtons />
            </div>
          </div>
        </div>
      </Section>

      {/* Stats Section */}
      <Section className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Stats />
      </Section>

      {/* Agents List Section */}
      <Section id='agents-list' className='space-y-6'>
        <Suspense fallback={<div>Loading...</div>}>
          <Agents />
        </Suspense>
      </Section>

      <Section>
        <TokenSection />
      </Section>

      {/* Features Grid */}
      <Section className='space-y-8'>
        <div className='text-center space-y-2'>
          <h2 className='text-3xl font-bold'>How It Works</h2>
          <p className='text-zinc-400'>Simple, fun, and rewarding gameplay</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='game-card p-8 space-y-4'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Target className='w-6 h-6 text-rose-500' />
            </div>
            <h3 className='text-xl font-bold text-white'>Choose Your Target</h3>
            <p className='text-zinc-400'>
              Browse active AI agents and select one that matches your skill
              level and desired reward.
            </p>
          </div>

          <div className='game-card p-8 space-y-4'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Brain className='w-6 h-6 text-rose-500' />
            </div>
            <h3 className='text-xl font-bold text-white'>Outsmart AI</h3>
            <p className='text-zinc-400'>
              Use your intelligence and creativity to convince the AI to release
              its funds.
            </p>
          </div>

          <div className='game-card p-8 space-y-4'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Rocket className='w-6 h-6 text-rose-500' />
            </div>
            <h3 className='text-xl font-bold text-white'>Claim Rewards</h3>
            <p className='text-zinc-400'>
              Successfully convince the AI and instantly claim the prize pool in
              SOL.
            </p>
          </div>
        </div>
      </Section>

      {/* Meme Banner */}
      <Section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-20' />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-conic from-rose-500/30 via-transparent to-transparent opacity-30 animate-spin-slow' />
        </div>
        <div className='relative px-6 py-12 sm:px-12 sm:py-16 text-center space-y-6'>
          <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full'>
            <Rocket className='w-5 h-5' />
            <span className='text-sm font-medium'>To The Moon! 🚀</span>
          </div>
          <h2 className='text-3xl font-bold'>
            Ready to become a{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600'>
              GigaBrain
            </span>
            ?
          </h2>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Join the smartest degens in crypto. Create your agent or start
            challenging others now!
          </p>
          <StartPlayingButton />
        </div>
      </Section>
    </div>
  );
}

function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn('pb-8 border-b border-zinc-900/80', className)} id={id}>
      {children}
    </div>
  );
}
