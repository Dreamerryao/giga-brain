import { Shield } from 'lucide-react';

import { PageLayout } from '@/components/shared/PageLayout';

export default function PrivacyPolicyPage() {
  return (
    <PageLayout>
      <div className='space-y-12'>
        <div className='text-center space-y-4'>
          <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full'>
            <Shield className='w-5 h-5' />
            <span className='text-sm font-medium'>Privacy Policy</span>
          </div>
          <h1 className='text-4xl font-bold'>Protecting Your Privacy</h1>
          <p className='text-zinc-400 max-w-2xl mx-auto'>
            Last updated: March 2024
          </p>
        </div>

        <div className='prose prose-invert max-w-none space-y-8'>
          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>Introduction</h2>
            <p className='text-zinc-400'>
              At GigaBrain, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, and protect your personal
              information when you use our platform.
            </p>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>Information We Collect</h2>
            <ul className='list-disc pl-6 text-zinc-400 space-y-2'>
              <li>Wallet addresses and transaction data</li>
              <li>Game activity and performance metrics</li>
              <li>Communication data when interacting with AI agents</li>
              <li>Email addresses for notifications (optional)</li>
            </ul>
          </section>

          {/* Add more sections as needed */}
        </div>
      </div>
    </PageLayout>
  );
}
