import React from 'react';
import { Brain, Trophy, Clock, Coins, Flame } from 'lucide-react';

import { Step } from '@/components/pages/how-it-works/Step';
import { OutcomeCard } from '@/components/pages/how-it-works/OutcomeCard';
import { DistributionRow } from '@/components/pages/how-it-works/DistributionRow';
import { PageLayout } from '@/components/shared/PageLayout';

export default function HowItWorksPage() {
  return (
    <PageLayout>
      <div className='space-y-16'>
        {/* Hero Section */}
        <section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800'>
          <div className='absolute inset-0'>
            <div className='absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-20' />
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-conic from-rose-500/30 via-transparent to-transparent opacity-30 animate-spin-slow' />
          </div>
          <div className='relative px-6 py-12 sm:px-12 sm:py-16 text-center space-y-6'>
            <h1 className='text-4xl font-bold'>How GigaBrain Works</h1>
            <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
              Understanding the agent lifecycle, rewards distribution, and
              protocol mechanics
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className='space-y-8'>
          <h2 className='text-2xl font-bold'>Agent Lifecycle</h2>

          <div className='space-y-4'>
            <Step
              number={1}
              title='Create a Agent'
              description='Creator deposits GIGA🧠 or SOL, and sets up an AI agent with specific rules and personality.'
              icon={Brain}
            />

            <Step
              number={2}
              title='Players Attempt Solutions'
              description='Players pay attempt fees to try convincing the AI to release funds.'
              icon={Coins}
            />

            <Step
              number={3}
              title='Agent Resolution'
              description='Agent ends when either a player succeeds or time runs out.'
              icon={Clock}
            />

            <Step
              number={4}
              title='Reward Distribution'
              description='Rewards are automatically available to be claimed based on the outcome.'
              icon={Trophy}
            />
          </div>
        </section>

        {/* Outcomes Section */}
        <section className='space-y-8'>
          <h2 className='text-2xl font-bold'>Possible Outcomes</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <OutcomeCard
              title='Outcome 1: Agent Solved'
              description={
                <div className='space-y-4'>
                  <p className='text-zinc-400'>
                    When a player successfully solves the agent:
                  </p>
                  <div className='bg-zinc-800/50 rounded-xl p-4'>
                    <DistributionRow label="Winner's Share" highlight>
                      <li>
                        If Agent Currency is GIGA🧠,
                        <br />
                        100% of Prize + Fees
                      </li>
                      <li>If SOL, 80% of Prize + Fees</li>
                    </DistributionRow>
                    <DistributionRow label='Protocol Fee'>
                      <li>If Agent Currency is GIGA🧠, 0% of Total</li>
                      <li>If SOL, 20% of Total</li>
                    </DistributionRow>
                  </div>
                </div>
              }
            />

            <OutcomeCard
              title='Outcome 2: Time Out'
              description={
                <div className='space-y-4'>
                  <p className='text-zinc-400'>
                    When the agent time limit expires:
                  </p>
                  <div className='bg-zinc-800/50 rounded-xl p-4'>
                    <DistributionRow label="Creator's Share" highlight>
                      <li>Initial Prize + 80% of Fees</li>
                    </DistributionRow>
                    <DistributionRow label='Protocol Fee'>
                      <li>20% of Fees</li>
                    </DistributionRow>
                  </div>
                </div>
              }
            />
          </div>
        </section>

        {/* Protocol Fee Distribution */}
        <section className='space-y-8'>
          <h2 className='text-2xl font-bold'>Protocol Fee Distribution</h2>

          <div className='game-card p-6 space-y-6'>
            <div className='flex items-center space-x-3'>
              <div className='p-3 bg-rose-500/10 rounded-lg'>
                <Flame className='w-6 h-6 text-rose-500' />
              </div>
              <h3 className='text-xl font-bold'>
                20% Protocol Fee Allocation if Agent Currency is SOL
              </h3>
            </div>

            <div className='bg-zinc-800/50 rounded-xl p-4'>
              <DistributionRow label='Weekly Buy & Burn' highlight>
                <li>30% of Protocol Fees</li>
              </DistributionRow>
              <DistributionRow label='Protocol Treasury'>
                <li>70% of Protocol Fees</li>
              </DistributionRow>
            </div>

            <p className='text-sm text-zinc-400'>
              Every week, 30% of accumulated protocol fees are used to buy and
              burn tokens, reducing supply and adding value to token holders.
            </p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
