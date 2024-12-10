'use client';

import React from 'react';

import { ConnectionWalletAdapterProvider } from './connection-wallet-adapter';
import { ConnectionProvider } from './connection';
import { WalletProvider } from './wallet/wallet';

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionWalletAdapterProvider>
      <ConnectionProvider>
        <WalletProvider>{children}</WalletProvider>
      </ConnectionProvider>
    </ConnectionWalletAdapterProvider>
  );
}
