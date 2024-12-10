'use client';

import { CoinsIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useUI } from '@/providers/ui';

export function HeaderAirdropButton() {
  const {
    faucetModal: { setIsOpened },
  } = useUI();

  return (
    <Button
      className='game-button group rounded-2xl h-12'
      onClick={() => setIsOpened(true)}
    >
      <span className='relative z-10 hidden lg:flex items-center'>
        Get Test Tokens
        <CoinsIcon className='w-5 h-5 ml-2 group-hover:rotate-12 transition-transform' />
      </span>
      <CoinsIcon className='size-5 lg:hidden' />
    </Button>
  );
}
