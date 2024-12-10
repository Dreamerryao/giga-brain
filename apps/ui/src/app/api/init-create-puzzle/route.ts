import * as anchor from '@coral-xyz/anchor';
import { serializeTx } from '@repo/lib/src/program/tx';

import { GbProgram } from '@/lib/program';
import { errorHandler } from '@/lib/next';
import { AVATARS_BASE_URL, UI_COMMITMENT } from '@/config';

export const POST = errorHandler<
  {
    creator: string;
    prompt: string;
    prizeAmount: number;
    name: string;
    fileType: string | null;
    avatarUrl: string | null;
    model: string;
    mint: string;
    metadata: string;
    baseFee: number;
    maxFee: number;
    maxAttempts: number;
    attemptTimeoutSeconds: number;
    attemptFinalTimeoutSeconds: number;
  },
  {
    tx: string;
    avatarUrl: string;
    fileName: string | null;
    puzzlePDA: string;
    blockhashWithExpiryBlockHeight: {
      blockhash: string;
      lastValidBlockHeight: number;
    };
    commitment: string;
  }
>(async function ({
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
}) {
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

  const { blockhashWithExpiryBlockHeight, tx } = await program.initCreatePuzzle(
    {
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
      commitment: UI_COMMITMENT,
    }
  );

  return {
    tx: serializeTx({ tx, requireAllSignatures: false }),
    avatarUrl,
    fileName,
    puzzlePDA: puzzlePDA.toBase58(),
    blockhashWithExpiryBlockHeight,
    commitment: UI_COMMITMENT,
  };
});
