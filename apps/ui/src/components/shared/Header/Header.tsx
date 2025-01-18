import { AlertTriangleIcon, Brain, PlusIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  getCreateAgentRoute,
  getHomeRoute,
  getLeaderboardRoute,
} from '@/lib/routes';
import { IS_PROD } from '@/config';

import { HeaderLink } from './HeaderLink';
import { WalletButton } from './WalletButton';
import { Notifications } from './Notifications';
import { HeaderAirdropButton } from './HeaderAirdropButton';

export const HEADER_HEIGHT = '200px';

export function Header() {
  return (
    <header className='flex flex-col fixed w-full z-[1]'>
      <div className='w-full bg-amber-500/10 border-b border-amber-500/20'>
        <a
          className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2 text-amber-400'
          href={'https://x.com/GigaBrainDotSo/status/1879166640866128188'}
          target='_blank'
          rel='noopener noreferrer'
        >
          <AlertTriangleIcon className='w-5 h-5' />
          <p className='text-sm font-medium'>
            GIGABRAIN is discontinued. Thank you for your support! 🙏
          </p>
        </a>
      </div>
      <div className='border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/50 flex w-full justify-center '>
        <div className='max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-2 lg:py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-8'>
              <Link
                href={getHomeRoute()}
                className='flex items-center space-x-3 group'
              >
                <div className='relative'>
                  <div className='absolute inset-0 bg-rose-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300' />
                  <Brain className='w-10 h-10 text-rose-500 relative z-10 transform group-hover:scale-110 transition-transform duration-300' />
                </div>
                <span className='text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-rose-400 neon-glow hidden lg:block'>
                  GigaBrain
                </span>
              </Link>

              <>
                <nav className='hidden lg:flex items-center space-x-6'>
                  {[
                    { name: 'Home', href: getHomeRoute() },
                    { name: 'Leaderboard', href: getLeaderboardRoute() },
                  ].map(({ name, href }) => (
                    <HeaderLink key={name} href={href}>
                      {name}
                    </HeaderLink>
                  ))}
                </nav>
              </>
            </div>

            <div className='flex items-center space-x-2 lg:space-x-4'>
              <>
                <Notifications />

                <Link href={getCreateAgentRoute()}>
                  <Button className='game-button group rounded-2xl h-12'>
                    <span className='relative z-10 hidden lg:flex items-center'>
                      Create Agent
                      <Brain className='w-5 h-5 ml-2 group-hover:rotate-12 transition-transform' />
                    </span>
                    <PlusIcon className='size-5 lg:hidden' />
                  </Button>
                </Link>

                {IS_PROD ? null : <HeaderAirdropButton />}

                <WalletButton />
              </>
            </div>
          </div>
        </div>{' '}
      </div>
    </header>
  );
}
