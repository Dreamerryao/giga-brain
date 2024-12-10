'use client';

import { ReactNode, createContext, useContext } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { useConnection as useBaseConnection } from '@solana/wallet-adapter-react';

const ConnectionContext = createContext<{
  connection: anchor.web3.Connection;
} | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const { connection } = useBaseConnection();

  return (
    <ConnectionContext.Provider
      value={{
        connection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useSolanaConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('Missing SolanaConnection context');
  }
  return context.connection;
}
