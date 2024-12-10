'use client';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { WalletIcon } from 'lucide-react';
import { formatNumber } from '@repo/lib/src/bn';
import BigNumber from 'bignumber.js';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { abbrAddr } from '@/lib/string';
import { useUI } from '@/providers/ui';
import { getPlayerRoute } from '@/lib/routes';
import { GIGA_DECIMALS, IS_PROD, SOL_DECIMALS } from '@/config';
import { cn } from '@/lib/utils';

import { WalletAvatar } from '../WalletAvatar';
import { Copy } from '../Copy';

export function WalletButton() {
  const { connectModal } = useUI();
  const { publicKey, solBalance, gigaBalance, wallet } = useSolanaWallet();
  const { faucetModal } = useUI();

  const address = publicKey?.toBase58();

  return !address ? (
    <button onClick={() => connectModal.setIsOpened(true)}>
      <ContainerButton>
        Connect
        <WalletIcon className='size-4 ml-2 group-hover:rotate-12 transition-transform' />
      </ContainerButton>
    </button>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ContainerButton className=''>
          <WalletAvatar address={address} size={28} />
          <div className='flex flex-col items-end flex-1'>
            <BalanceValue value={solBalance} decimals={SOL_DECIMALS}>
              SOL
            </BalanceValue>
            <BalanceValue value={gigaBalance} decimals={GIGA_DECIMALS}>
              GIGA🧠
            </BalanceValue>
          </div>
        </ContainerButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='dark'>
        <DropdownMenuItem>
          <Link href={getPlayerRoute(address)}>My Activity</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href={getPlayerRoute(address)}>{abbrAddr(address)}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.preventDefault()}>
          <Copy text={address}>Copy Address</Copy>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {IS_PROD ? null : (
          <DropdownMenuItem
            onClick={() => {
              faucetModal.setIsOpened(true);
            }}
          >
            <button>
              <>Get Test Tokens</>
            </button>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <button
            onClick={() => {
              connectModal.setIsOpened(true);
            }}
          >
            Change Wallet
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button onClick={() => wallet?.disconnect()}>Disconnect</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ContainerButton({
  children,
  className,
  ...props
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        `flex items-center space-x-3 px-2 lg:px-4 h-12 rounded-2xl bg-zinc-800/50 
         border border-zinc-700/50 hover:bg-zinc-800 transition-all duration-300
         hover:border-rose-500/50 group`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function BalanceValue({
  value,
  decimals,
  children,
}: PropsWithChildren<{ value: BigNumber; decimals: number }>) {
  return (
    <div className='text-xs text-rose-400 text-nowrap flex items-center justify-end gap-1 w-full'>
      <span className='text-right'>
        {formatNumber(value.div(10 ** decimals), 2)}
      </span>
      <span className='w-10 text-left'>{children}</span>
    </div>
  );
}
