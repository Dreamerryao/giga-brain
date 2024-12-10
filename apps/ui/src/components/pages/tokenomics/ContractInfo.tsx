'use client';

import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useUI } from '@/providers/ui';
import { abbrAddr } from '@/lib/string';

export function ContractInfo() {
  const {
    mediaQueries: { isMD },
  } = useUI();
  const contractAddress = 'GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump';

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
  };

  return (
    <div className='game-card p-6 space-y-4'>
      <h3 className='text-xl font-bold'>Contract Details</h3>

      <div className='bg-zinc-800/50 rounded-xl p-4'>
        <div className='flex items-center justify-between'>
          <code className='text-sm text-zinc-400 '>
            {isMD ? contractAddress : abbrAddr(contractAddress)}
          </code>
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              onClick={copyAddress}
              className='p-2 hover:bg-rose-500/10 text-zinc-400 hover:text-white'
            >
              <Copy className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              onClick={() =>
                window.open(
                  `https://solscan.io/token/${contractAddress}`,
                  '_blank'
                )
              }
              className='p-2 hover:bg-rose-500/10 text-zinc-400 hover:text-white'
            >
              <ExternalLink className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
