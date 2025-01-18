import React from 'react';

import { Header } from './Header/Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-zinc-950 text-white flex flex-col w-full items-center'>
      <div className='fixed inset-0 bg-gradient-radial from-rose-500/10 via-transparent to-transparent pointer-events-none' />
      <Header />
      {children}
    </div>
  );
}
