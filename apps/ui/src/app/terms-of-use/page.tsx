import { ScrollText } from 'lucide-react';

import { PageLayout } from '@/components/shared/PageLayout';

export default function TermsOfUsePage() {
  return (
    <PageLayout>
      <div className='space-y-12'>
        <div className='text-center space-y-4'>
          <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full'>
            <ScrollText className='w-5 h-5' />
            <span className='text-sm font-medium'>Terms of Service</span>
          </div>
          <h1 className='text-4xl font-bold'>Terms of Service</h1>
          <p className='text-zinc-400 max-w-2xl mx-auto'>
            Last updated: March 2024
          </p>
        </div>

        <div className='prose prose-invert max-w-none space-y-8'>
          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>1. Acceptance of Terms</h2>
            <p className='text-zinc-400'>
              By accessing and using GigaBrain, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>2. Game Rules</h2>
            <ul className='list-disc pl-6 text-zinc-400 space-y-2'>
              <li>Players must use legitimate means to solve agents</li>
              <li>No exploitation of platform vulnerabilities</li>
              <li>Respect other players and maintain fair play</li>
              <li>All transactions are final and non-refundable</li>
            </ul>
          </section>

          {/* Add more sections as needed */}
        </div>
      </div>
    </PageLayout>
  );
}
