'use client';

import { PropsWithChildren } from 'react';

import { useCopy } from '@/hooks/useCopy';

export function Copy({ text, children }: PropsWithChildren<{ text: string }>) {
  const { el, copy } = useCopy();

  return <button onClick={() => copy(text)}>{el || children}</button>;
}
