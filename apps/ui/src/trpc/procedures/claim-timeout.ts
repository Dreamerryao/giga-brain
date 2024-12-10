import { z } from 'zod';
import * as anchor from '@coral-xyz/anchor';
import { serializeTx } from '@repo/lib/src/program/tx';
import { TRPCError } from '@trpc/server';

import { GbProgram } from '@/lib/program';

import { publicProcedure } from '../trpc';

export const claimTimeout = publicProcedure
  .input(
    z.object({
      puzzlePDA: z.string(),
    })
  )
  .output(
    z.object({
      tx: z.string(),
    })
  )
  .mutation(async ({ input: { puzzlePDA } }) => {
    try {
      const program = await GbProgram.new();
      const puzzle = await program.getPuzzle(
        new anchor.web3.PublicKey(puzzlePDA)
      );
      const creator = puzzle.creator;
      const tx = await (
        await program.creatorClaimTimeout({
          puzzlePDA: new anchor.web3.PublicKey(puzzlePDA),
        })
      ).transaction();

      await program.addFeePayer({ tx, payer: creator });
      await program.addRecentBlockhash({ tx, commitment: 'processed' });
      // await program.addPriorityFeeIx({ tx });

      return {
        tx: serializeTx({ tx, requireAllSignatures: false }),
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
