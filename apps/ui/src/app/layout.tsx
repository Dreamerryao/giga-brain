import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';

import './globals.css';
import { Layout } from '@/components/shared/Layout';
import { cn } from '@/lib/utils';
import { Providers } from '@/providers';
import { Modals } from '@/components/modals/Modals';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'GigaBrain',
  description: 'Outsmart AI, Win Crypto Rewards',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={cn(spaceGrotesk.className, 'antialiased')}>
        <Providers>
          <Layout>
            {children}
            <Modals />
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
