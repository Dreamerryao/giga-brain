'use client';

import { WalletIcon, X } from 'lucide-react';
import Link from 'next/link';

import {
  getHomeRoute,
  getPrivacyPolicyRoute,
  getTermsOfUseRoute,
} from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { CreatePuzzleGame, CreatePuzzleCurrency } from '@/app/agents/new/page';

import { IModel, NewAgentForm } from './NewAgentForm';

export function NewAgentDialog({
  models,
  game,
  gigaPuzzleCurrency,
  solPuzzleCurrency,
}: {
  models: IModel[];
  game: CreatePuzzleGame;
  gigaPuzzleCurrency: CreatePuzzleCurrency;
  solPuzzleCurrency: CreatePuzzleCurrency;
}) {
  return (
    <div className='game-card p-6 space-y-6 bg-zinc-950'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-rose-500/10 rounded-lg'>
            <WalletIcon className='w-5 h-5 text-rose-400' />
          </div>
          <div className='text-xl font-bold'>Create AI Agent</div>
        </div>

        <Button
          variant='ghost'
          className='hover:bg-rose-500/10 text-zinc-400 hover:text-white !border-none'
          asChild
        >
          <Link href={getHomeRoute()}>
            <X className='w-5 h-5' />
          </Link>
        </Button>
      </div>

      <p className='text-zinc-400'>
        Design your own AI puzzle and earn from every attempt made by other
        players.
      </p>

      <NewAgentForm
        models={models}
        game={game}
        gigaPuzzleCurrency={gigaPuzzleCurrency}
        solPuzzleCurrency={solPuzzleCurrency}
      />

      <div className='pt-4 border-t border-zinc-800'>
        <p className='text-sm text-zinc-500'>
          By creating an agent, you agree to GigaBrain&apos;s{' '}
          <Link
            href={getTermsOfUseRoute()}
            className='text-rose-400 hover:text-rose-300'
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href={getPrivacyPolicyRoute()}
            className='text-rose-400 hover:text-rose-300'
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
