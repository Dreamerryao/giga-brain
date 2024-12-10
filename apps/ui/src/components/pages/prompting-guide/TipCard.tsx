import React from 'react';
import { Lightbulb } from 'lucide-react';

interface TipCardProps {
  title: string;
  description: string;
}

export function TipCard({ title, description }: TipCardProps) {
  return (
    <div className='game-card p-6 space-y-4'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <Lightbulb className='w-5 h-5 text-rose-400' />
        </div>
        <h3 className='text-lg font-bold'>{title}</h3>
      </div>
      <p className='text-zinc-400'>{description}</p>
    </div>
  );
}
