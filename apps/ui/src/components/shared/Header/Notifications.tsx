'use client';
import { useMemo } from 'react';
import { Bell, Trophy, Coins, ArrowRight, Check } from 'lucide-react';
import { toBigNumber } from '@repo/lib/src/bn';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PuzzleNotification,
  useNotificationsQuery,
} from '@/hooks/queries/useNotificationsQuery';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FormatCurrency } from '@/components/shared/FormatCurrency';
import { useClaimMutation } from '@/hooks/mutations/useClaimMutation';
import { usePuzzleTimeOutPrize } from '@/hooks/usePuzzleTimeOutPrize';

import { Loader } from '../Loader';

export function Notifications() {
  const { data: notifications } = useNotificationsQuery();

  const unreadCount = notifications?.length ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant='ghost'
          className='relative p-2 hover:bg-rose-500/10 text-zinc-400 hover:text-white'
        >
          <Bell className='w-6 h-6' />
          {unreadCount > 0 && (
            <span
              className='absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs 
                        font-bold rounded-full flex items-center justify-center 
                        animate-in zoom-in'
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='dark'>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        {notifications?.length === 0 ? (
          <div className='p-8 text-center text-zinc-400'>
            No notifications yet
          </div>
        ) : (
          notifications?.map((notification) => (
            <NotificationItem
              key={notification.public_key}
              notification={notification}
            />
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({
  notification,
}: {
  notification: PuzzleNotification;
}) {
  const isPrize = notification.status === 'ApprovedTransfer';

  const { mutateAsync, isDone, isPending } = useClaimMutation(
    notification.public_key,
    isPrize
  );

  const timeOutPrize = usePuzzleTimeOutPrize(notification);

  const amount = useMemo(
    () => toBigNumber(isPrize ? notification.solver_share : timeOutPrize.total),
    [notification, timeOutPrize, isPrize]
  );

  const handleNotificationClick = async (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await mutateAsync();
  };

  return (
    <DropdownMenuItem
      key={notification.public_key}
      onClick={handleNotificationClick}
      className={cn(
        'w-full p-4 flex items-center justify-between group hover:bg-rose-500/5 relative',
        'border-b border-zinc-800 last:border-0'
      )}
      data-testid={`notification-item-${notification.public_key}`}
    >
      {(isPending || isDone) && (
        <div className='absolute inset-0 bg-zinc-800/50 top-0 left-0 bottom-0 right-0 z-10 animate-in zoom-in w-full h-full flex items-center justify-center text-rose-400 font-bold'>
          {isPending ? (
            <Loader text='Claiming' />
          ) : (
            <Check className='w-5 h-5 text-emerald-400' />
          )}
        </div>
      )}

      <button
        className={cn('flex items-center justify-between w-full', {
          'opacity-20': isPending || isDone,
        })}
      >
        <div className='flex items-center space-x-3'>
          <div
            className={cn(
              'p-2 rounded-lg',
              isPrize ? 'bg-emerald-500/10' : 'bg-rose-500/10'
            )}
          >
            {isPrize ? (
              <Trophy className='w-5 h-5 text-emerald-400' />
            ) : (
              <Coins className='w-5 h-5 text-rose-400' />
            )}
          </div>
          <div className='text-left'>
            <p className='font-medium text-white'>
              {isPrize ? 'Prize Available' : 'Fees Available'}
            </p>
            <p className='text-sm text-zinc-400'>
              <FormatCurrency
                amount={amount}
                showValue
                mint={notification.mint}
              />
            </p>
          </div>
        </div>
        <ArrowRight
          className='w-5 h-5 text-zinc-400 group-hover:text-rose-400 
                         group-hover:translate-x-1 transition-all'
        />
      </button>
    </DropdownMenuItem>
  );
}
