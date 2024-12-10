'use client';

import { PropsWithChildren } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
} from '@tanstack/react-query';

export const queryClient = new QueryClient({});

queryClient.setDefaultOptions({
  queries: {
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
