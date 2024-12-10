import React from 'react';
import { ListChecks } from 'lucide-react';

interface MilestoneProps {
  title: string;
  items: string[];
}

export function QuarterlyMilestones({ title, items }: MilestoneProps) {
  return (
    <div className='game-card p-6 space-y-4'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <ListChecks className='w-5 h-5 text-rose-400' />
        </div>
        <h3 className='text-xl font-bold'>{title}</h3>
      </div>
      <ul className='space-y-3'>
        {items.map((item, index) => (
          <li key={index} className='flex items-center space-x-3'>
            <span className='w-1.5 h-1.5 rounded-full bg-rose-500' />
            <span className='text-zinc-400'>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
