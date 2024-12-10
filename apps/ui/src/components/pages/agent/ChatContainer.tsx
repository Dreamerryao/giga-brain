'use client';

import { useEffect, useMemo } from 'react';
import { useIntersectionObserver } from '@uidotdev/usehooks';
import { Loader2 } from 'lucide-react';

import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useAgentPage } from './AgentPageProvider';
import { ChatTimedOut } from './ChatTimedOut';
import { ChatSolved } from './ChatSolved';

export function ChatContainer() {
  const [loadingRef, loadingEntry] = useIntersectionObserver();
  const {
    attempts: {
      olderMessages,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      status: puzzleStatus,
      newMessages,
    },
    status,
  } = useAgentPage();

  const totalLoadedMessages = useMemo(
    () => (olderMessages?.length ?? 0) + (newMessages?.length ?? 0),
    [olderMessages, newMessages]
  );

  useEffect(() => {
    if (loadingEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [loadingEntry, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className='flex flex-col h-full pt-[72px] lg:pt-24'>
      <div className='flex-1 overflow-y-auto px-6 py-8 space-y-6 min-h-[calc(100vh-22rem)] max-h-[calc(100vh-22rem)] flex flex-col-reverse gap-4'>
        {puzzleStatus === 'pending' && (
          <div className='flex items-center justify-center h-64'>
            <Loader2 className='w-6 h-6 animate-spin' />
          </div>
        )}

        {puzzleStatus === 'error' && (
          <div className='flex items-center justify-center h-64 text-red-500'>
            Error loading chat history
          </div>
        )}

        {newMessages?.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {totalLoadedMessages === 0 && (
          <div className='flex flex-col items-center justify-center h-full text-center flex-1'>
            <div className='p-4 bg-rose-500/10 rounded-full'>
              <div className='w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center'>
                <span className='text-3xl'>🧠</span>
              </div>
            </div>
            <div className='max-w-sm'>
              <h3 className='text-xl font-bold text-white mb-2'>
                No attempts yet
              </h3>
              <p className='text-zinc-400'>
                Try to convince the AI to release its funds. Be creative and
                think outside the box!
              </p>
            </div>
          </div>
        )}

        {olderMessages?.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        <div ref={loadingRef} className='h-px w-full' />

        {isFetchingNextPage && (
          <div className='flex justify-center py-2'>
            <Loader2 className='w-6 h-6 animate-spin' />
          </div>
        )}
      </div>

      <div className='glass-panel-chat rounded-b-none p-2 lg:p-4 absolute bottom-0 left-0 right-0 flex-1 w-full h-[180px] flex flex-col'>
        {status === 'TimedOut' ? (
          <ChatTimedOut />
        ) : status === 'Completed' ? (
          <ChatSolved />
        ) : (
          <ChatInput />
        )}
        {/* cover bottom with 1px of background to hide bottom box shadow effect */}
        <div className='absolute bottom-0 left-[1px] right-[1px] h-[1px] bg-zinc-900/80' />
      </div>
    </div>
  );
}
