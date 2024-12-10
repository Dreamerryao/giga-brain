import { z } from 'zod';
import * as anchor from '@coral-xyz/anchor';
import { serializeTx } from '@repo/lib/src/program/tx';
import { TRPCError } from '@trpc/server';

import { GbProgram } from '@/lib/program';

import { publicProcedure } from '../trpc';

const COMMITMENT = 'processed';

export const initRecordAttempt = publicProcedure
  .input(
    z.object({
      puzzlePDA: z.string(),
      solver: z.string(),
      prompt: z.string(),
      maxFee: z.number(),
      metadata: z.string(),
    })
  )
  .output(
    z.object({
      tx: z.string(),
      blockhashWithExpiryBlockHeight: z.object({
        blockhash: z.string(),
        lastValidBlockHeight: z.number(),
      }),
      commitment: z.string(),
    })
  )
  .mutation(
    async ({ input: { puzzlePDA, solver, prompt, maxFee, metadata } }) => {
      try {
        const program = await GbProgram.new();
        const { tx, blockhashWithExpiryBlockHeight } =
          await program.initRecordAttempt({
            puzzlePDA: new anchor.web3.PublicKey(puzzlePDA),
            solver: new anchor.web3.PublicKey(solver),
            maxFee,
            prompt,
            metadata,
            commitment: COMMITMENT,
          });
        return {
          tx: serializeTx({ tx, requireAllSignatures: false }),
          blockhashWithExpiryBlockHeight,
          commitment: COMMITMENT,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to create puzzle',
          cause: error,
        });
      }
    }
  );
