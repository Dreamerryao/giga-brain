import React from 'react';
import { Calculator } from 'lucide-react';
import * as anchor from '@coral-xyz/anchor';
import { formatNumber } from '@repo/lib/src/bn';

import { FormatCurrency } from '@/components/shared/FormatCurrency';

export function PayoutCalculator({
  baseFee,
  maxFee,
  maxAttempts,
  mint,
  serviceFee,
  decimals,
}: {
  baseFee: number;
  maxFee: number;
  maxAttempts: number;
  mint: anchor.web3.PublicKey;
  serviceFee: number;
  decimals: number;
}) {
  const { averageFee, totalFees } = calculateExponentialGrowth(
    baseFee * 10 ** decimals,
    maxFee * 10 ** decimals,
    maxAttempts
  );

  return (
    <div className='game-card p-4 space-y-3'>
      <div className='flex items-center space-x-2'>
        <div className='p-1.5 bg-rose-500/10 rounded-lg'>
          <Calculator className='w-4 h-4 text-rose-400' />
        </div>
        <span className='text-sm font-medium'>Estimated Earnings</span>
      </div>

      <div className='bg-zinc-800/50 rounded-xl p-4 space-y-2'>
        <div className='flex justify-between text-sm'>
          <span className='text-zinc-400'>Average Fee</span>
          <span className='text-white'>
            <FormatCurrency amount={averageFee} mint={mint} showValue />
          </span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-zinc-400'>Max Attempts</span>
          <span className='text-white'>{maxAttempts}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span className='text-zinc-400'>Creator Share</span>
          <span className='text-white'>
            {formatNumber((1 - serviceFee) * 100, 0)}%
          </span>
        </div>
        <div className='h-px bg-zinc-700 my-2' />
        <div className='flex justify-between font-medium'>
          <span className='text-rose-400'>Potential Earnings</span>
          <span className='text-rose-400'>
            <FormatCurrency
              amount={(1 - serviceFee) * totalFees}
              mint={mint}
              showValue
            />
          </span>
        </div>
      </div>

      <p className='text-xs text-zinc-500'>
        *Estimated earnings if the agent times out without being successfully
        challenged. Actual results may vary depending on player activity.
      </p>
    </div>
  );
}

function calculateExponentialGrowth(
  startFee: number, // Initial fee
  endFee: number, // Final fee
  steps: number // Number of steps
): { averageFee: number; totalFees: number } {
  if (steps <= 1) {
    return { averageFee: 0, totalFees: 0 };
  }

  // Calculate the growth rate (k) for the exponential function
  const k = Math.log(endFee / startFee) / (steps - 1);

  // Calculate total fees (area under the curve) as the sum of the exponential values
  let totalFees = 0;
  for (let i = 0; i < steps; i++) {
    totalFees += startFee * Math.exp(k * i);
  }

  // Calculate the average fee
  const averageFee = totalFees / steps;

  return { averageFee, totalFees };
}
