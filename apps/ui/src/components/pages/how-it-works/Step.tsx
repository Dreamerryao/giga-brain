import React from 'react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

export function Step({ number, title, description, icon: Icon }: StepProps) {
  return (
    <div className='relative flex gap-6'>
      <div className='flex flex-col items-center'>
        <div className='flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20'>
          <span className='text-lg font-bold text-rose-400'>{number}</span>
        </div>
        {number !== 4 && <div className='flex-1 w-px bg-zinc-800 my-4' />}
      </div>
      <div className='flex-1 pb-12'>
        <div className='game-card p-6 space-y-4'>
          <div className='p-3 bg-rose-500/10 rounded-lg w-fit'>
            <Icon className='w-6 h-6 text-rose-500' />
          </div>
          <h3 className='text-xl font-bold'>{title}</h3>
          <p className='text-zinc-400'>{description}</p>
        </div>
      </div>
    </div>
  );
}
