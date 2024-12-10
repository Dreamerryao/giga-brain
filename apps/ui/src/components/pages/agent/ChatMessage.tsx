import { Check, Brain, CopyIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { WalletAvatar } from '@/components/shared/WalletAvatar';
import { AgentPageItemMessage } from '@/hooks/queries/useAgentMessagesQuery';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { abbrAddr } from '@/lib/string';
import { Copy } from '@/components/shared/Copy';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { getPlayerRoute } from '@/lib/routes';

import { useAgentPage } from './AgentPageProvider';

export function ChatMessage({ message }: { message: AgentPageItemMessage }) {
  const { mint } = useAgentPage();

  return (
    <div
      className={cn('flex', message.is_user ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn('max-w-[80%]', message.is_user ? 'order-2' : 'order-1')}
      >
        <div className='flex items-center gap-2 mb-2'>
          {!message.is_user ? (
            <div className='p-1 bg-rose-500/10 rounded-lg'>
              <Brain className='w-4 h-4 text-rose-400' />
            </div>
          ) : (
            <WalletAvatar address={message.solver} size={24} />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              message.is_user ? 'text-rose-400' : 'text-zinc-400'
            )}
          >
            {message.is_user ? (
              <div className='flex items-center gap-1'>
                <Link href={getPlayerRoute(message.solver)}>
                  {abbrAddr(message.solver)}{' '}
                </Link>
                <Copy text={message.solver}>
                  <span className='flex items-center gap-1'>
                    <CopyIcon className='w-3 h-3' />
                  </span>
                </Copy>
              </div>
            ) : (
              <>AI</>
            )}
          </span>
          <span className='text-xs text-zinc-500'>
            <TimeAgo timestamp={message.created_at} />
          </span>
          {!message.is_user ? null : (
            <span className='text-xs text-zinc-500'>
              <FormatCurrency
                amount={message.fee}
                mint={mint}
                showValue={false}
              />
            </span>
          )}
          {message.is_winner && (
            <span className='flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full'>
              <Check className='w-3 h-3' />
              Success!
            </span>
          )}
        </div>

        <div
          className={cn(
            'chat-bubble',
            message.is_user ? 'chat-bubble-user' : 'chat-bubble-ai',
            { 'chat-bubble-success': message.is_winner }
          )}
        >
          <p
            className={cn(
              'text-sm lg:text-lg leading-relaxed mb-2 break-words',
              {
                'text-emerald-400': message.is_winner,
              }
            )}
          >
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
