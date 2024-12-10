'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getPrivacyPolicyRoute, getTermsOfUseRoute } from '@/lib/routes';
import { useUI } from '@/providers/ui';

import { WalletSelector } from './WalletSelector';

export function WalletDialog() {
  const {
    connectModal: { isOpened },
  } = useUI();
  return !isOpened ? null : <WalletDialogInner />;
}

function WalletDialogInner() {
  const {
    connectModal: { isOpened, setIsOpened },
  } = useUI();

  return (
    <Dialog.Root open={isOpened} onOpenChange={setIsOpened}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm  z-50' />
        <Dialog.Content
          className='fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] 
                           w-full max-w-md dark  z-50'
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className='game-card p-6 space-y-6 bg-zinc-950'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-rose-500/10 rounded-lg'>
                  <Wallet className='w-5 h-5 text-rose-400' />
                </div>
                <Dialog.Title className='text-xl font-bold'>
                  Connect Wallet
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <Button
                  variant='ghost'
                  className='hover:bg-rose-500/10 text-zinc-400 hover:text-white'
                >
                  <X className='w-5 h-5' />
                </Button>
              </Dialog.Close>
            </div>

            <p className='text-zinc-400'>
              Connect your wallet to start playing GigaBrain. Choose your
              preferred wallet:
            </p>

            <WalletSelector />

            <div className='pt-4 border-t border-zinc-800'>
              <p className='text-sm text-zinc-500'>
                By connecting a wallet, you agree to GigaBrain&apos;s{' '}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
