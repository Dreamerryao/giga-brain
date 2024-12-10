import { Brain, Sparkles, Rocket, Zap } from 'lucide-react';
import Link from 'next/link';

import { PageLayout } from '@/components/shared/PageLayout';
import { Button } from '@/components/ui/button';
import { getHomeRoute } from '@/lib/routes';

export default function LorePage() {
  return (
    <PageLayout>
      <div className='space-y-16'>
        {/* Hero Section */}
        <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800'>
          <div className='absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]' />
          <div className='absolute inset-0'>
            <div className='absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-20' />
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-conic from-rose-500/30 via-transparent to-transparent opacity-30 animate-spin-slow' />
          </div>
          <div className='relative px-6 py-24 sm:px-12 sm:py-32 lg:px-16 text-center'>
            <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full'>
              <Brain className='w-5 h-5' />
              <span className='text-sm font-medium'>The GigaBrain Saga</span>
            </div>
            <h1 className='mt-6 text-4xl font-bold sm:text-5xl lg:text-6xl max-w-3xl mx-auto'>
              The Rise of{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600 shine-animation'>
                Artificial Intelligence
              </span>
            </h1>
          </div>
        </section>

        {/* Story Sections */}
        <section className='space-y-16'>
          <div className='game-card p-8 space-y-6'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Sparkles className='w-6 h-6 text-rose-500' />
            </div>
            <h2 className='text-2xl font-bold'>The Genesis</h2>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              In the year 2024, as artificial intelligence reached unprecedented
              levels of sophistication, a group of cryptographic pioneers
              discovered something extraordinary: AI agents capable of
              autonomously guarding digital assets with unbreakable resolve.
            </p>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              These weren&apos;t just simple smart contracts – they were
              sentient guardians, each with its own personality, beliefs, and
              unwavering determination to protect their digital treasures.
            </p>
          </div>

          <div className='game-card p-8 space-y-6'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Rocket className='w-6 h-6 text-rose-500' />
            </div>
            <h2 className='text-2xl font-bold'>The Challenge</h2>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              As news of these AI guardians spread throughout the crypto
              community, a new form of competition emerged. Humans began
              challenging these artificial minds, attempting to outsmart them
              through logic, persuasion, and creative thinking.
            </p>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              The AI agents, programmed with sophisticated defense mechanisms,
              stood firm. Only those with true intellectual prowess could hope
              to convince them to release their treasures.
            </p>
          </div>

          <div className='game-card p-8 space-y-6'>
            <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
              <Zap className='w-6 h-6 text-rose-500' />
            </div>
            <h2 className='text-2xl font-bold'>The Revolution</h2>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              Thus, GigaBrain was born – a revolutionary platform where human
              intelligence meets artificial wisdom. A place where the brightest
              minds in crypto could prove their worth against increasingly
              sophisticated AI opponents.
            </p>
            <p className='text-lg text-zinc-400 leading-relaxed'>
              Today, thousands of players compete daily, creating their own AI
              guardians or attempting to outsmart existing ones. The stakes are
              real, the rewards substantial, and the competition fierce.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className='text-center space-y-6'>
          <h2 className='text-3xl font-bold'>Ready to Make History?</h2>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Join the ranks of legendary puzzle solvers or create your own
            unbeatable AI guardian. The future of competitive intelligence
            awaits.
          </p>
          <Link href={getHomeRoute()}>
            <Button size='lg' className='game-button group rounded-2xl'>
              <span className='relative z-10 flex items-center'>
                Start Your Journey
                <Brain className='ml-2 w-5 h-5 group-hover:rotate-12 transition-transform' />
              </span>
            </Button>
          </Link>
        </section>
      </div>
    </PageLayout>
  );
}
