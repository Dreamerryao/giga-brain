import { Flame } from 'lucide-react';

import { TokenDistribution } from '@/components/pages/tokenomics/TokenDistribution';
import { BurnEvent } from '@/components/pages/tokenomics/BurnEvent';
import { TokenInfo } from '@/components/pages/tokenomics/TokenInfo';
import { WeeklyBurn } from '@/components/pages/tokenomics/WeeklyBurn';
import { ContractInfo } from '@/components/pages/tokenomics/ContractInfo';
import { MarketData } from '@/components/pages/tokenomics/MarketData';
import { PageLayout } from '@/components/shared/PageLayout';

export default function TokenomicsPage() {
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
            <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full'>
              <Flame className='w-5 h-5' />
              <span className='text-sm font-medium'>$GIGA🧠 Token</span>
            </div>
            <h1 className='text-4xl font-bold'>
              Community-Owned{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600'>
                Game Token
              </span>
            </h1>
            <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
              Launched on PumpFun, now fully owned by the community with
              automated weekly burns
            </p>
          </div>
        </section>

        <section className='space-y-8'>
          <h2 className='text-2xl font-bold'>GIGA🧠 Usage</h2>

          <ul className='game-card p-6 space-y-6'>
            <li>
              Agents can be created with GIGA🧠 or SOL. If an agent is created
              with GIGA🧠, solver gets collected 100% of the Agent Pool Funds.
              If an agent is created with SOL, solver gets collected only 80% of
              the Agent Pool Funds.
              <br />
              If the Agent times out, the creator gets 100% of the Agent Pool
              Funds if created with GIGA🧠. If created with SOL, the creator
              gets 80% of the Agent Pool Funds.
              <br />
              This should incentivize users to create agents with GIGA🧠!
            </li>
            <li>
              Protocol fees are collected on Agents created using SOL. 30% of
              the protocol fees are used to buy and burn GIGA🧠 on a weekly
              basis, reducing supply and adding value to token holders.
            </li>
          </ul>
        </section>

        <div className='space-y-8'>
          <ContractInfo />
          <MarketData />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <TokenInfo />
          <TokenDistribution />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <BurnEvent />
          <WeeklyBurn />
        </div>
      </div>
    </PageLayout>
  );
}
