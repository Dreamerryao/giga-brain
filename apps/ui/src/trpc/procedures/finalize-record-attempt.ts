import { z } from 'zod';
import * as anchor from '@coral-xyz/anchor';
import { TRPCError } from '@trpc/server';

import { GbProgram } from '@/lib/program';

import { publicProcedure } from '../trpc';

export const finalizeRecordAttempt = publicProcedure
  .input(
    z.object({
      mint: z.string(),
      tx: z.string(),
      prompt: z.string(),
      metadata: z.string(),
      blockhashWithExpiryBlockHeight: z.object({
        blockhash: z.string(),
        lastValidBlockHeight: z.number(),
      }),
      commitment: z.string(),
    })
  )
  .output(
    z.object({
      signature: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        mint,
        tx,
        prompt,
        metadata,
        blockhashWithExpiryBlockHeight,
        commitment,
      },
    }) => {
      try {
        const program = await GbProgram.new();
        const signature = await program.finalizeRecordAttemptWithPayer({
          mint: new anchor.web3.PublicKey(mint),
          tx,
          prompt,
          metadata,
          promptsVerifier: program.promptsVerifier,
          blockhashWithExpiryBlockHeight,
          commitment: commitment as anchor.web3.Commitment,
          confirmTx: false,
        });
        return {
          signature,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : '',
          cause: error,
        });
      }
    }
  );
