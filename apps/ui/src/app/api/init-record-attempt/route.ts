import * as anchor from '@coral-xyz/anchor';
import { serializeTx } from '@repo/lib/src/program/tx';

import { GbProgram } from '@/lib/program';
import { errorHandler } from '@/lib/next';
import { UI_COMMITMENT } from '@/config';

export const POST = errorHandler<
  {
    puzzlePDA: string;
    solver: string;
    prompt: string;
    maxFee: number;
    metadata: string;
  },
  {
    tx: string;
    blockhashWithExpiryBlockHeight: {
      blockhash: string;
      lastValidBlockHeight: number;
    };
    commitment: string;
  }
>(async function ({ puzzlePDA, solver, prompt, maxFee, metadata }) {
  const program = await GbProgram.new();
  const { tx, blockhashWithExpiryBlockHeight } =
    await program.initRecordAttempt({
      puzzlePDA: new anchor.web3.PublicKey(puzzlePDA),
      solver: new anchor.web3.PublicKey(solver),
      maxFee,
      prompt,
      metadata,
      commitment: UI_COMMITMENT,
    });
  return {
    tx: serializeTx({ tx, requireAllSignatures: false }),
    blockhashWithExpiryBlockHeight,
    commitment: UI_COMMITMENT,
  };
});
