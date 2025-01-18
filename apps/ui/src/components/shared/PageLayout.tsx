import { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

import { Footer } from './Footer';
import { HEADER_HEIGHT } from './Header/Header';

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
          'relative max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col flex-1 w-full',
          {
            'pb-8': !!footer,
          }
        )}
        style={{
          paddingTop: HEADER_HEIGHT,
        }}
      >
        {children}
      </main>

      {!footer ? null : <Footer />}
    </>
  );
}
