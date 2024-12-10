'use client';

import {
  createTRPCProxyClient,
  createTRPCReact,
  httpBatchLink,
} from '@trpc/react-query';
import type { PropsWithChildren } from 'react';

import { queryClient } from '@/providers/query';
import type { AppRouter } from '@/trpc/app-router';

const clientOpts = {
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
};

export const trpc = createTRPCReact<AppRouter>({});

export const trpcProxyClient = createTRPCProxyClient<AppRouter>(clientOpts);

export const trcpClient = trpc.createClient(clientOpts);

export function TrpcProvider({ children }: PropsWithChildren) {
  return (
    <trpc.Provider client={trcpClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}
