import React from 'react';

import { cn } from '@/lib/utils';

interface OutcomeCardProps {
  title: string;
  description: React.ReactNode;
  className?: string;
}

export function OutcomeCard({
  title,
  description,
  className,
}: OutcomeCardProps) {
  return (
    <div className={cn('game-card p-6 space-y-4', className)}>
      <h3 className='text-xl font-bold'>{title}</h3>
      {description}
    </div>
  );
}
