import * as anchor from '@coral-xyz/anchor';
import { supabase } from '@repo/lib/src/supabase';
import { deserializeTx } from '@repo/lib/src/program/tx';

import { GbProgram } from '@/lib/program';
import { errorHandler } from '@/lib/next';
import { AVATARS_BASE_URL } from '@/config';

export const POST = errorHandler<
  {
    mint: string;
    tx: string;
    prompt: string;
    metadata: string;
    blockhashWithExpiryBlockHeight: {
      blockhash: string;
      lastValidBlockHeight: number;
    };
    commitment: string;
  },
  {
    signedUploadUrl: string | null;
    signature: string;
  }
>(async function ({
  tx,
  prompt,
  metadata,
  blockhashWithExpiryBlockHeight,
  commitment,
  ...input
}) {
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
});
