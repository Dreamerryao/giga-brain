'use client';

import { UIProvider } from './ui';
import { QueryProvider } from './query';
import { SolanaProvider } from './solana';
import { TrpcProvider } from './trpc';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <TrpcProvider>
        <QueryProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </QueryProvider>
      </TrpcProvider>
    </UIProvider>
  );
}
