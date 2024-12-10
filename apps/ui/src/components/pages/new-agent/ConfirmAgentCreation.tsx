'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, CoinsIcon, X } from 'lucide-react';
import Link from 'next/link';
import { formatNumber, toBigNumber } from '@repo/lib/src/bn';
import * as anchor from '@coral-xyz/anchor';

import { Button } from '@/components/ui/button';
import { getPrivacyPolicyRoute, getTermsOfUseRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { Loader } from '@/components/shared/Loader';
import { useCreateAgentMutation } from '@/hooks/mutations/useCreateAgentMutation';

export function ConfirmAgentCreation({
  mutation: {
    mutateAsync,
    isPending,
    formData: { funds },
  },
  showConfirmModal,
  setShowConfirmModal,
  mint,
  decimals,
  creatorShare,
}: {
  mutation: ReturnType<typeof useCreateAgentMutation>;
  showConfirmModal: boolean;
  setShowConfirmModal: (show: boolean) => void;
  mint: anchor.web3.PublicKey;
  decimals: number;
  creatorShare: number;
}) {
  const onConfirm = async () => {
    await mutateAsync();
    setShowConfirmModal(false);
  };

  return (
    <Dialog.Root open={showConfirmModal} onOpenChange={setShowConfirmModal}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm  z-50' />
        <Dialog.Content
          className='fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] 
                           w-full max-w-md  z-50'
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <div className='game-card p-6 space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-rose-500/10 rounded-lg'>
                  <CoinsIcon className='w-5 h-5 text-rose-400' />
                </div>
                <Dialog.Title className='text-xl font-bold'>
                  Confirm Agent Creation
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <Button
                  variant='ghost'
                  className='hover:bg-rose-500/10 text-zinc-400 hover:text-white'
                  disabled={isPending}
                >
                  <X className='w-5 h-5' />
                </Button>
              </Dialog.Close>
            </div>

            <div
              className={cn(
                'flex items-center space-x-2 px-4 py-3 rounded-xl',
                'bg-rose-500/10 border border-rose-500/20'
              )}
            >
              <AlertCircle className='w-5 h-5 text-rose-400' />
              <p className='text-sm text-rose-400'>
                Initial agent funds:{' '}
                <FormatCurrency
                  amount={toBigNumber(funds).times(toBigNumber(10 ** decimals))}
                  showValue
                  mint={mint}
                />
              </p>
            </div>

            <p className='text-zinc-400 text-sm'>
              By confirming, you agree to deposit the agent creation funds. If
              your agent times out, you&apos;ll receive back your deposit plus{' '}
              {formatNumber(creatorShare * 100, 0)}% of the accumalated fees.
              The deposit is non-refundable if your agent approves transfer of
              the prize pool to a challenger.
            </p>

            <div className='flex gap-3'>
              <Button
                onClick={onConfirm}
                disabled={isPending}
                className='flex-1 game-button group'
              >
                <span className='flex items-center justify-center'>
                  {isPending ? (
                    <Loader text='Processing' />
                  ) : (
                    'Confirm & Create'
                  )}
                  <CoinsIcon className='ml-2 w-5 h-5 group-hover:rotate-12 transition-transform' />
                </span>
              </Button>
              <Button
                onClick={() => setShowConfirmModal(false)}
                disabled={isPending}
                variant='outline'
                className='flex-1 text-zinc-950'
              >
                Cancel
              </Button>
            </div>

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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
