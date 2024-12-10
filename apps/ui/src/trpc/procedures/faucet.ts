import { z } from 'zod';
import * as anchor from '@coral-xyz/anchor';
import { TRPCError } from '@trpc/server';

import { GbProgram } from '@/lib/program';

import { publicProcedure } from '../trpc';

const AMOUNT = 200_000;

export const faucet = publicProcedure
  .input(
    z.object({
      pubkey: z.string(),
    })
  )
  .output(z.object({ signature: z.string() }))
  .mutation(async ({ input: { pubkey } }) => {
    try {
      const gbProgram = await GbProgram.new();
      const sig = await gbProgram.faucetToken({
        owner: new anchor.web3.PublicKey(pubkey),
        amount: AMOUNT,
      });
      return {
        signature: sig,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          error instanceof Error ? error.message : 'Failed to create puzzle',
        cause: error,
      });
    }
  });
