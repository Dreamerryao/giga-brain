import { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

import { Footer } from './Footer';

export function PageLayout({
  children,
  footer = true,
}: PropsWithChildren<{
  footer?: boolean;
  hiddenOnLoad?: boolean;
}>) {
  return (
    <>
      <main
        className={cn(
          'relative max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 flex flex-col flex-1 w-full',
          {
            'pb-8': !!footer,
          }
        )}
      >
        {children}
      </main>

      {!footer ? null : <Footer />}
    </>
  );
}
