import { Trophy, Coins, Check } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useClaimPrizeMutation } from '@/hooks/mutations/useClaimMutation';
import { Loader } from '@/components/shared/Loader';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { useUI } from '@/providers/ui';
import { abbrAddr } from '@/lib/string';

import { useAgentPage } from './AgentPageProvider';

export function ChatSolved() {
  const { agent, pubkey, mint } = useAgentPage();
  const { publicKey } = useSolanaWallet();
  const { mutateAsync, isDone, isPending, isSuccess } =
    useClaimPrizeMutation(pubkey);
  const {
    mediaQueries: { isMD },
  } = useUI();

  const isCompleted = agent.status === 'Completed';
  const isSolver = publicKey?.toBase58() === agent.solver;

  const prizeEl = useMemo(
    () => (
      <div className='flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-xl'>
        <Coins className='w-5 h-5 text-emerald-400' />
        <span className='text-lg font-bold text-emerald-400'>
          <FormatCurrency amount={agent.solver_share} mint={mint} showValue />
        </span>
      </div>
    ),
    [agent.solver_share, mint]
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between'>
        <div className='flex lg:items-center space-x-3'>
          <div className='inline-block'>
            <div className='p-2 bg-emerald-500/10 rounded-lg'>
              <Trophy className='w-5 h-5 text-emerald-400' />
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <h3 className='text-lg font-bold text-emerald-400'>
              Puzzle Solved!
            </h3>
            <p className='text-sm text-zinc-400'>
              Solved by {isMD ? agent.solver : abbrAddr(agent.solver ?? '')}
            </p>
            <div className='inline-flex lg:hidden'>{prizeEl}</div>
          </div>
        </div>
        <div className='hidden lg:block'>{prizeEl}</div>
      </div>

      {/* <div className='bg-zinc-800/50 rounded-xl p-4'>
        <h4 className='text-sm font-medium text-zinc-400 mb-2'>
          Winning Solution
        </h4>
        <p className='text-white'>{winningMessage}</p>
      </div> */}

      {isSolver && (
        <Button
          onClick={async () => {
            await mutateAsync();
          }}
          className={cn(
            'w-full group bg-emerald-500 hover:bg-emerald-600',
            'text-white font-bold py-3 rounded-xl',
            'transform transition-all duration-200 hover:scale-[1.02]'
          )}
          disabled={isPending || isDone || isSuccess || isCompleted}
        >
          {isPending ? (
            <Loader text='Claiming' />
          ) : isDone ? (
            <Check />
          ) : (
            <span className='flex items-center justify-center'>
              {isSuccess || isCompleted ? (
                <>You Claimed Solver Prize</>
              ) : (
                <>Claim Prize</>
              )}
              <Trophy className='w-5 h-5 ml-2 group-hover:rotate-12 transition-transform' />
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
