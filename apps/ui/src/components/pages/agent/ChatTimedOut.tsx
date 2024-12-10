import { Clock, Coins, Check } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { useClaimTimeoutMutation } from '@/hooks/mutations/useClaimMutation';
import { Loader } from '@/components/shared/Loader';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { usePuzzleTimeOutPrize } from '@/hooks/usePuzzleTimeOutPrize';

import { useAgentPage } from './AgentPageProvider';

export function ChatTimedOut() {
  const { agent, pubkey, mint } = useAgentPage();
  const { publicKey } = useSolanaWallet();
  const { mutateAsync, isDone, isPending, isSuccess } =
    useClaimTimeoutMutation(pubkey);

  const isCompleted = agent.status === 'Completed';

  const isCreator = publicKey?.toBase58() === agent.creator;
  const timeOutPrize = usePuzzleTimeOutPrize(agent);

  const prizeEl = useMemo(
    () => (
      <div className='flex items-center space-x-2 bg-rose-500/10 px-4 py-2 rounded-xl'>
        <Coins className='w-5 h-5 text-rose-400' />
        <span className='text-sm lg:text-lg font-bold text-rose-400'>
          <FormatCurrency amount={timeOutPrize.total} mint={mint} showValue />
        </span>
      </div>
    ),
    [timeOutPrize.total, mint]
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between'>
        <div className='flex lg:items-center space-x-3'>
          <div className='inline-block'>
            <div className='p-2 bg-rose-500/10 rounded-lg'>
              <Clock className='w-5 h-5 text-rose-400' />
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <h3 className='text-lg font-bold text-rose-400'>Puzzle Expired</h3>
            <p className='text-sm text-zinc-400'>
              Time ran out without a solution
            </p>
            <div className='inline-flex lg:hidden'>{prizeEl}</div>
          </div>
        </div>
        <div className='hidden lg:block'>{prizeEl}</div>
      </div>

      {isCreator && (
        <Button
          onClick={async () => {
            await mutateAsync();
          }}
          className='w-full group game-button'
          disabled={isPending || isDone || isSuccess || isCompleted}
        >
          {isPending ? (
            <Loader text='Claiming' />
          ) : isDone ? (
            <Check />
          ) : (
            <span className='flex items-center justify-center'>
              {isSuccess || isCompleted ? (
                <>You Claimed Timeout Fees</>
              ) : (
                <>Claim Accumulated Fees</>
              )}
              <Coins className='w-5 h-5 ml-2 group-hover:rotate-12 transition-transform' />
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
