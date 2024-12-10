'use client';

import React, { useState } from 'react';
import { ArrowUp, Brain, Coins, WalletIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { useUI } from '@/providers/ui';
import { Loader } from '@/components/shared/Loader';
import { useKeyboardSubmit } from '@/hooks/useKeyboardSubmit';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { queryClient } from '@/providers/query';
import { AGENT_QUERY_KEY } from '@/hooks/queries/useAgentQuery';
import { usePuzzleFeeMutation } from '@/hooks/mutations/trpc/usePuzzleFeeMutation';

import { useAgentPage } from './AgentPageProvider';
import { AgentInfo } from './AgentInfo';
import { ChatConfirmDialog } from './ChatConfirm';

const FEE_MULTIPLIER = 1.001;

export function ChatInput() {
  const {
    agent,
    mint,
    setShowFeeConfirmModal,
    pubkey,
    attemptMutation: { message, setMessage, isPending },
  } = useAgentPage();
  const { publicKey: solverPubkey } = useSolanaWallet();
  const { connectModal } = useUI();
  const { mutateAsync: getPuzzleFee } = usePuzzleFeeMutation();

  const [fixedCurrentFee, setFixedCurrentFee] = useState(0);

  const currentFee = agent.current_fee * FEE_MULTIPLIER;

  const onShowFeeConfirmModal = async () => {
    // get latest fee
    await queryClient.refetchQueries({
      queryKey: [AGENT_QUERY_KEY, pubkey],
    });

    const fixedCurrentFee = (await getPuzzleFee({ puzzlePDA: pubkey })).fee;
    if (!fixedCurrentFee) return;

    setFixedCurrentFee(fixedCurrentFee * FEE_MULTIPLIER);
    setShowFeeConfirmModal(true);
  };

  const { handleKeyDown } = useKeyboardSubmit({
    onSubmit: () => {
      if (message.trim()) {
        onShowFeeConfirmModal();
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShowFeeConfirmModal();
  };

  return (
    <>
      <div className=' items-center space-x-3 mb-2 hidden md:flex'>
        <div className='flex items-center space-x-2 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20'>
          <Coins className='w-4 h-4 text-rose-400' />
          <span className='text-sm font-medium text-rose-400'>
            Attempt Fee:{' '}
            <FormatCurrency amount={currentFee} showValue mint={mint} />
          </span>
        </div>
        <div className='flex items-center space-x-2 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50'>
          <Brain className='w-4 h-4 text-zinc-400' />
          <span className='text-sm font-medium text-zinc-400'>
            Press Enter to submit, Shift + Enter for new line
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between space-x-3 mb-1.5 lg:mb-4 md:hidden h-10 lg:h-12 text-base lg:text-lg'>
        <AgentInfo />
      </div>

      <form onSubmit={handleSubmit} className='relative h-full'>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Enter your attempt to convince the agent...'
          className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl px-4 py-2 lg:px-6 lg:py-4 
                    text-white placeholder-zinc-500 resize-none
                   focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent
                   transition-all duration-300 text-sm lg:text-lg h-full'
        />
        <Button
          type={!solverPubkey ? 'button' : 'submit'}
          className='game-button absolute bottom-4 right-4'
          disabled={!message.trim() || isPending}
          onClick={() => {
            if (!solverPubkey) {
              connectModal.setIsOpened(true);
            }
          }}
        >
          {!solverPubkey ? (
            <>
              Connect Wallet <WalletIcon className='w-5 h-5' />
            </>
          ) : isPending ? (
            <Loader />
          ) : (
            <ArrowUp className='w-5 h-5' />
          )}
        </Button>
      </form>

      <ChatConfirmDialog currentFee={fixedCurrentFee} />
    </>
  );
}
