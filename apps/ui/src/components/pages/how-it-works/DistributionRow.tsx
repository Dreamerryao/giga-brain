import React from 'react';

import { cn } from '@/lib/utils';

interface DistributionRowProps {
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}

export function DistributionRow({
  label,
  children,
  highlight,
}: DistributionRowProps) {
  return (
    <div
      className={cn(
        'flex justify-between py-3 border-b border-zinc-800 last:border-0',
        highlight && 'text-rose-400 font-medium'
      )}
    >
      <span>{label}</span>
      <ul className='space-y-4'>{children}</ul>
    </div>
  );
}
