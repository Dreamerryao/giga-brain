'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { CheckIcon, CopyIcon, Droplets, ExternalLink, X } from 'lucide-react';
import { formatNumber } from '@repo/lib/src/bn';

import { Button } from '@/components/ui/button';
import { useUI } from '@/providers/ui';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { cn } from '@/lib/utils';
import { abbrAddr } from '@/lib/string';
import { GIGA_DECIMALS } from '@/config';
import { useProgress } from '@/hooks/useProgress';
import { useFaucetMutation } from '@/hooks/mutations/trpc/useFaucetMutation';

import { Copy } from '../shared/Copy';
import { Loader } from '../shared/Loader';

export function FaucetModal() {
  const {
    faucetModal: { setIsOpened },
  } = useUI();

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm  z-50' />
        <Dialog.Content
          className='fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] 
                           w-full max-w-xl dark z-50'
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className='game-card p-6 space-y-6 bg-zinc-950  min-h-[400px]'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-rose-500/10 rounded-lg'>
                  <Droplets className='w-5 h-5 text-rose-400' />
                </div>
                <Dialog.Title className='text-lg lg:text-xl font-bold'>
                  Get Devnet Test Tokens
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <Button
                  variant='ghost'
                  className='hover:bg-rose-500/10 text-zinc-400 hover:text-white'
                  onClick={() => setIsOpened(false)}
                >
                  <X className='w-5 h-5' />
                </Button>
              </Dialog.Close>
            </div>

            <Faucet />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Faucet() {
  const { publicKey, gigaBalance } = useSolanaWallet();

  return (
    <>
      <div className='space-y-6'>
        {/* Step 1 */}
        <div className='space-y-3'>
          <div className='flex items-center space-x-2'>
            <div className='w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold'>
              1
            </div>
            <h3 className='font-medium'>Copy your wallet address</h3>
          </div>
          <div className='flex items-center relative'>
            <code className='flex-1 px-3 py-2 bg-zinc-800/50 rounded-lg text-zinc-400  text-sm'>
              {abbrAddr(publicKey?.toBase58() ?? '')}
            </code>
            <div className='absolute right-2 top-0 bottom-0 flex items-center'>
              <Copy text={publicKey?.toBase58() ?? ''}>
                <Button variant='ghost' className='p-2 hover:bg-rose-500/10'>
                  <CopyIcon className='w-5 h-5 text-zinc-400' />
                </Button>
              </Copy>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className='space-y-3'>
          <div className='flex items-center space-x-2'>
            <div className='w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold'>
              2
            </div>
            <h3 className='font-medium'>Request Test SOL from faucet</h3>
          </div>
          <Button
            onClick={() => window.open('https://faucet.solana.com/', '_blank')}
            className={cn(
              'w-full group bg-zinc-800/50 hover:bg-rose-500/10',
              'border border-zinc-700/50 hover:border-rose-500/20'
            )}
          >
            <span className='flex items-center justify-center text-white'>
              Open Solana Faucet
              <ExternalLink className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </span>
          </Button>
        </div>

        {/* Step 3 */}
        <div className='space-y-3'>
          <div className='flex items-center space-x-2'>
            <div className='w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold'>
              3
            </div>
            <h3 className='font-medium'>Get Test GIGA🧠</h3>
          </div>
          <div className='flex flex-col lg:grid lg:grid-cols-2 gap-2'>
            <h3 className='font-medium flex items-center'>
              Balance: {formatNumber(gigaBalance.div(10 ** GIGA_DECIMALS), 2)}
            </h3>
            <AirdropGIGA />
          </div>
        </div>

        {/* Step 4 */}
        <div className='space-y-3'>
          <div className='flex items-center space-x-2'>
            <div className='w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold'>
              4
            </div>
            <h3 className='font-medium'>Start playing!</h3>
          </div>
          <p className='text-sm text-zinc-400'>
            Once you receive the GIGA🧠 & SOL, you can start creating agentsor
            attempting to solve them.
          </p>
        </div>
      </div>
    </>
  );
}

function AirdropGIGA() {
  const { publicKey } = useSolanaWallet();
  const { isDone, done } = useProgress();

  // const mutation = trpc.faucet.useMutation();
  const mutation = useFaucetMutation();

  return (
    <Button
      onClick={async () => {
        done(() =>
          mutation.mutateAsync({
            pubkey: publicKey?.toBase58() ?? '',
          })
        );
      }}
      className='w-full game-button text-white px-2'
    >
      {mutation.isPending ? (
        <Loader text='Requesting' />
      ) : isDone ? (
        <div className='flex gap-2 items-center'>
          Received <CheckIcon size={16} />
        </div>
      ) : (
        <>Request GIGA🧠</>
      )}
    </Button>
  );
}
