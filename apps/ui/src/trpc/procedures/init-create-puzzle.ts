import { z } from 'zod';
import * as anchor from '@coral-xyz/anchor';
import { serializeTx } from '@repo/lib/src/program/tx';
import { TRPCError } from '@trpc/server';

import { GbProgram } from '@/lib/program';
import { AVATARS_BASE_URL } from '@/config';

import { publicProcedure } from '../trpc';

const COMMITMENT = 'processed';

export const initCreatePuzzle = publicProcedure
  .input(
    z.object({
      creator: z.string(),
      prompt: z.string(),
      prizeAmount: z.number(),
      name: z.string(),
      fileType: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      model: z.string(),
      mint: z.string(),
      metadata: z.string(),
      baseFee: z.number(),
      maxFee: z.number(),
      maxAttempts: z.number(),
      attemptTimeoutSeconds: z.number(),
      attemptFinalTimeoutSeconds: z.number(),
    })
  )
  .output(
    z.object({
      tx: z.string(),
      avatarUrl: z.string(),
      fileName: z.string().nullable(),
      puzzlePDA: z.string(),
      blockhashWithExpiryBlockHeight: z.object({
        blockhash: z.string(),
        lastValidBlockHeight: z.number(),
      }),
      commitment: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        prompt,
        prizeAmount,
        name,
        fileType,
        model,
        metadata,
        baseFee,
        maxFee,
        maxAttempts,
        attemptTimeoutSeconds,
        attemptFinalTimeoutSeconds,
        ...input
      },
    }) => {
      try {
        const program = await GbProgram.new();

        const puzzleNonce = program.getRandomPuzzleNonce();
        const creator = new anchor.web3.PublicKey(input.creator);
        const puzzlePDA = program.getPuzzlePDA({ creator, nonce: puzzleNonce });
        const mint = new anchor.web3.PublicKey(input.mint);

        let avatarUrl = input.avatarUrl;
        let fileName: string | null = null;
        if (fileType) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(fileType)) {
            throw new Error('Invalid file type');
          }

          // Create deterministic path
          const extension = fileType.split('/')[1];
          fileName = `${puzzleNonce}.${extension}`;
          avatarUrl = `${AVATARS_BASE_URL}/${fileName}`;
        }

        if (!avatarUrl) {
          throw new Error('Avatar is required');
        }

        const { blockhashWithExpiryBlockHeight, tx } =
          await program.initCreatePuzzle({
            puzzlePDA,
            creator,
            prizeAmount,
            prompt,
            puzzleNonce,
            name,
            avatarUrl,
            model,
            mint,
            metadata,
            baseFee,
            maxFee,
            maxAttempts,
            attemptTimeoutSeconds,
            attemptFinalTimeoutSeconds,
            commitment: COMMITMENT,
          });

        return {
          tx: serializeTx({ tx, requireAllSignatures: false }),
          avatarUrl,
          fileName,
          puzzlePDA: puzzlePDA.toBase58(),
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
