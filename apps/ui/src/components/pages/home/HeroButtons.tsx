'use client';

import { ArrowDown, Brain } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getCreateAgentRoute } from '@/lib/routes';

export function HeroButtons() {
  return (
    <>
      <Button
        size='lg'
        onClick={() =>
          document
            .getElementById('agents-list')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
        className='game-button group rounded-2xl py-6'
      >
        Challenge Agents
        <ArrowDown className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
      </Button>
      <Link href={getCreateAgentRoute()}>
        <Button
          size='lg'
          variant='ghost'
          className='cyber-button rounded-2xl py-6 w-full'
        >
          Create Your Agent
        </Button>
      </Link>
    </>
  );
}

export function StartPlayingButton() {
  return (
    <Button
      size='lg'
      onClick={() =>
        document
          .getElementById('agents-list')
          ?.scrollIntoView({ behavior: 'smooth' })
      }
      className='game-button group rounded-2xl'
    >
      <span className='relative z-10 flex items-center'>
        Start Playing
        <Brain className='ml-2 w-5 h-5 group-hover:rotate-12 transition-transform' />
      </span>
    </Button>
  );
}
