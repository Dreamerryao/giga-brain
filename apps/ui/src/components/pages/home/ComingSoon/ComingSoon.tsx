'use client';

import { Brain, Rocket, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DEVNET_LINK } from '@/lib/links';
import { TokenSection } from '@/components/pages/home/TokenSection';
import { NewsletterForm } from '@/components/shared/NewsletterForm';

import { CountdownTimer } from './Countdown';

export function ComingSoon() {
  return (
    <div className='space-y-16'>
      {/* Hero Section */}

      <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800'>
        <div className='absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]' />
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-20' />
          <div className='absolute -top-24 -right-24 w-96 h-96 bg-rose-500/30 rounded-full blur-3xl' />
          <div className='absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl' />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-conic from-rose-500/30 via-transparent to-transparent opacity-30 animate-spin-slow' />
        </div>
        <div className='relative px-6 py-24 sm:px-12 sm:py-32 lg:px-16'>
          <div className='max-w-2xl mx-auto space-y-8 text-center'>
            <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full'>
              <Rocket className='w-5 h-5' />
              <span className='text-sm font-medium'>
                Coming Soon to Mainnet! 🚀
              </span>
            </div>
            <h1 className='text-4xl font-bold sm:text-5xl lg:text-6xl'>
              The Ultimate{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600 shine-animation'>
                AI vs Human
              </span>{' '}
              Game
            </h1>
            <p className='text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto'>
              GigaBrain is launching soon on mainnet! Challenge AI agents, win
              GIGA🧠 or SOL rewards, and prove you&apos;re the smartest degen in
              crypto.
            </p>

            <CountdownTimer />

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <a href={DEVNET_LINK} target='_blank' rel='noopener noreferrer'>
                <Button size='lg' className='game-button group rounded-2xl'>
                  <span className='relative z-10 flex items-center'>
                    Try on Devnet
                    <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </span>
                </Button>
              </a>
              <Button
                size='lg'
                variant='outline'
                onClick={() =>
                  document
                    .getElementById('notify')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className='cyber-button rounded-2xl'
              >
                Get Notified
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className='space-y-8'>
        <div className='text-center space-y-2'>
          <h2 className='text-3xl font-bold'>What&apos;s Coming?</h2>
          <p className='text-zinc-400'>
            Get ready for the ultimate crypto gaming experience
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='game-card p-8 space-y-4'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Brain className='w-6 h-6 text-rose-500' />
            </div>
            <h3 className='text-xl font-bold text-white'>Advanced AI Agents</h3>
            <p className='text-zinc-400'>
              Battle against sophisticated AI agents with unique personalities
              and defense mechanisms.
            </p>
          </div>

          <div className='game-card p-8 space-y-4'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Rocket className='w-6 h-6 text-rose-500' />
            </div>
            <h3 className='text-xl font-bold text-white'>
              Real GIGA🧠 and SOL Rewards
            </h3>
            <p className='text-zinc-400'>
              Win substantial GIGA🧠 and SOL prizes by outsmarting AI agents.
              Instant payouts guaranteed. payouts guaranteed.
            </p>
          </div>

          <div className='game-card p-8 space-y-4'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Brain className='w-6 h-6 text-rose-500' />
            </div>
            <h3 className='text-xl font-bold text-white'>Create & Earn</h3>
            <p className='text-zinc-400'>
              Design your own AI puzzles and earn from every attempt made by
              other players.
            </p>
          </div>
        </div>
      </section>

      <section>
        <TokenSection />
      </section>

      {/* Newsletter Section */}
      <section
        id='notify'
        className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800'
      >
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-20' />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-conic from-rose-500/30 via-transparent to-transparent opacity-30 animate-spin-slow' />
        </div>
        <div className='relative px-6 py-12 sm:px-12 sm:py-16 text-center'>
          <div className='max-w-xl mx-auto space-y-6'>
            <h2 className='text-3xl font-bold'>Be the First to Know</h2>
            <p className='text-lg text-zinc-400'>
              Get notified when GigaBrain launches on mainnet and receive
              exclusive early access benefits.
            </p>

            <NewsletterForm className='flex gap-2'>
              <input
                name='email'
                type='email'
                placeholder='Enter your email'
                className='flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl 
                           text-white placeholder-zinc-500 focus:outline-none focus:ring-2 
                           focus:ring-rose-500 focus:border-transparent'
                required
              />
              <Button type='submit' className='game-button rounded-xl'>
                Notify Me
              </Button>
            </NewsletterForm>
          </div>
        </div>
      </section>
    </div>
  );
}
