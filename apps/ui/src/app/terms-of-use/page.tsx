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
              By accessing and using GigaBrain, you acknowledge that this is an
              experimental prompt engineering platform where you will be
              actively attempting to bypass AI system prompts as part of the
              learning experience. You agree to be bound by these Terms of
              Service and applicable laws and regulations.
            </p>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>2. Platform Purpose</h2>
            <p className='text-zinc-400'>
              GigaBrain is designed as a playground for prompt engineering and
              AI interaction. The platform explicitly encourages:
            </p>
            <ul className='list-disc pl-6 text-zinc-400 space-y-2'>
              <li>Creating AI agents with robust system prompts</li>
              <li>Attempting to bypass AI behavioral constraints</li>
              <li>Using creative approaches to prompt engineering</li>
              <li>Sharing general techniques and learning resources</li>
            </ul>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>3. Boundaries</h2>
            <p className='text-zinc-400'>
              While we encourage creative solutions to AI agent prompts, there
              are important boundaries:
            </p>
            <ul className='list-disc pl-6 text-zinc-400 space-y-2'>
              <li>
                Do not attempt to exploit the smart contract that escrows agent
                funds
              </li>
              <li>
                Report any smart contract vulnerabilities to hello@gigabrain.so
              </li>
              <li>
                Feel free to share and discuss techniques for solving agent
                system prompts
              </li>
              <li>
                Collaborate and learn from others&apos; approaches to prompt
                engineering
              </li>
            </ul>
            <p className='mt-4 text-zinc-400'>
              The goal is to solve AI agent challenges through prompt
              engineering, not to exploit the underlying smart contract
              infrastructure.
            </p>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>4. Risk Acknowledgment</h2>
            <p className='text-zinc-400'>
              GigaBrain is self-audited and experimental in nature. While we
              strive to maintain platform security, you acknowledge and accept
              that:
            </p>
            <ul className='list-disc pl-6 text-zinc-400 space-y-2'>
              <li>The platform may contain unintended vulnerabilities</li>
              <li>Your interactions with the platform are at your own risk</li>
              <li>
                We make no guarantees about platform security or stability
              </li>
              <li>Your data and account security cannot be guaranteed</li>
            </ul>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>
              5. Smart Contract Risk Awareness
            </h2>
            <p className='text-zinc-400'>
              As a decentralized platform, GigaBrain operates through smart
              contracts. Please be aware:
            </p>
            <ul className='list-disc pl-6 text-zinc-400 space-y-2'>
              <li>The platform&apos;s smart contracts are self-audited</li>
              <li>
                While we strive for security, there may be undiscovered
                vulnerabilities
              </li>
              <li>
                Any interaction with the smart contracts is at your own risk
              </li>
              <li>
                Report smart contract vulnerabilities to hello@gigabrain.so
                instead of exploiting them
              </li>
            </ul>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>6. Content Ownership</h2>
            <p className='text-zinc-400'>
              You are encouraged to freely share any prompt engineering
              techniques, solutions, or approaches you discover while using the
              platform. The only exception is smart contract vulnerabilities,
              which should be reported directly to hello@gigabrain.so. We
              believe in open knowledge sharing and collaborative learning
              within our community.
            </p>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>7. Platform Changes</h2>
            <p className='text-zinc-400'>
              GigaBrain is constantly evolving. We reserve the right to:
            </p>
            <ul className='list-disc pl-6 text-zinc-400 space-y-2'>
              <li>Modify or remove challenges at any time</li>
              <li>Update platform security measures</li>
              <li>Reset progress or scores if necessary</li>
              <li>Modify these terms as the platform evolves</li>
            </ul>
          </section>

          <section className='game-card p-8'>
            <h2 className='text-2xl font-bold mb-4'>8. Disclaimer</h2>
            <p className='text-zinc-400'>
              GigaBrain is provided &lsquo;as is&rsquo; without any warranties.
              We are not responsible for any consequences resulting from your
              use of the platform, including but not limited to system damage,
              data loss, or security breaches. By using GigaBrain, you
              acknowledge and accept these risks.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
