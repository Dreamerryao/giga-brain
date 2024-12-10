import { supabase } from '@repo/lib/src/supabase';
import { z } from 'zod';
import * as anchor from '@coral-xyz/anchor';
import { deserializeTx } from '@repo/lib/src/program/tx';
import { TRPCError } from '@trpc/server';

import { GbProgram } from '@/lib/program';
import { AVATARS_BASE_URL } from '@/config';

import { publicProcedure } from '../trpc';

export const finalizeCreatePuzzle = publicProcedure
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
      signedUploadUrl: z.string().nullable(),
      signature: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        tx,
        prompt,
        metadata,
        blockhashWithExpiryBlockHeight,
        commitment,
        ...input
      },
    }) => {
      try {
        const gbProgram = await GbProgram.new();

        const mint = new anchor.web3.PublicKey(input.mint);

        const deserializedTx = deserializeTx(tx);
        const parsedTx = await gbProgram.parseLocalTx<{
          avatarUrl: string;
        }>({
          tx: deserializedTx,
          ixName: gbProgram.getMintIsNative(mint)
            ? 'createPuzzle'
            : 'createPuzzleToken',
        });

        let signedUploadUrl: string | null = null;
        const avatarUrl = parsedTx?.data.avatarUrl;
        if (avatarUrl?.startsWith(AVATARS_BASE_URL)) {
          const fileName = avatarUrl.split('/').pop();
          if (fileName) {
            const { data, error } = await supabase.storage
              .from('avatars')
              .createSignedUploadUrl(fileName, {
                upsert: false,
              });
            if (error) {
              throw new Error('Failed to generate upload URL');
            }
            signedUploadUrl = data.signedUrl;
          }
        }

        const signature = await gbProgram.finalizeCreatePuzzleWithPayer({
          mint,
          tx,
          prompt,
          metadata,
          promptsVerifier: gbProgram.promptsVerifier,
          blockhashWithExpiryBlockHeight,
          commitment: commitment as anchor.web3.Commitment,
          confirmTx: false,
        });

        return {
          signedUploadUrl,
          signature,
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
