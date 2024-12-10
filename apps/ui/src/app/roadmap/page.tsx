import { Brain, Rocket, Network } from 'lucide-react';

import { PageLayout } from '@/components/shared/PageLayout';
import { RoadmapEvent } from '@/components/pages/roadmap/RoadmapEvent';
import { QuarterlyMilestones } from '@/components/pages/roadmap/QuarterlyMilestones';

export default function RoadmapPage() {
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
            <h1 className='text-4xl font-bold'>Project Roadmap</h1>
            <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
              Our journey to revolutionize AI gaming on Solana
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className='space-y-8'>
          <RoadmapEvent
            date='December 21st, 2024'
            title='Project Launch'
            description='Born during the Solana AI Hackathon, introducing the first version of AI-powered puzzle challenges.'
            icon={Brain}
            isActive
          />

          <RoadmapEvent
            date='January 7th, 2025'
            title='Mainnet Launch'
            description='Official launch on Solana mainnet with enhanced security features and improved AI interactions.'
            icon={Rocket}
            isActive
          />

          <div className='pl-[72px] space-y-6'>
            <h2 className='text-2xl font-bold'>Q1 2025 Expansion</h2>
            <QuarterlyMilestones
              title='New Features & Game Modes'
              items={[
                'Secret Word Agents',
                'New agent types including ELIZA-inspired personalities',
                'Season challenges with global jackpot rewards',
                'Team-based challenges: Defense vs Offense modes',
                'Enhanced AI interaction patterns',
              ]}
            />
          </div>

          <RoadmapEvent
            date='Q2 2025'
            title='Decentralized AI Processing'
            description='Integration with Chainlink and Pyth for decentralized LLM processing, making the game fully trustless.'
            icon={Network}
          />
        </section>
      </div>
    </PageLayout>
  );
}
