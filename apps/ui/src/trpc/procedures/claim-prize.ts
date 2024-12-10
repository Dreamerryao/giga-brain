import { z } from 'zod';
import * as anchor from '@coral-xyz/anchor';
import { serializeTx } from '@repo/lib/src/program/tx';
import { supabase } from '@repo/lib/src/supabase';
import { TRPCError } from '@trpc/server';

import { GbProgram } from '@/lib/program';

import { publicProcedure } from '../trpc';

export const claimPrize = publicProcedure
  .input(
    z.object({
      puzzlePDA: z.string(),
    })
  )
  .output(
    z.object({
      tx: z.string(),
      error: z.string().optional(),
    })
  )
  .mutation(async ({ input: { puzzlePDA } }) => {
    try {
      const program = await GbProgram.new();

      const { data: puzzles } = await supabase
        .from('puzzle')
        .select('solver')
        .eq('public_key', puzzlePDA);
      const solver = puzzles?.[0].solver;
      if (!solver) {
        throw new Error('Solver not found');
      }
      const solverPubkey = new anchor.web3.PublicKey(solver);
      const tx = await (
        await program.claimPrize({
          puzzlePDA: new anchor.web3.PublicKey(puzzlePDA),
          solver: solverPubkey,
        })
      ).transaction();

      await program.addFeePayer({ tx, payer: solverPubkey });
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
