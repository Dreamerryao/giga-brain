import * as anchor from '@coral-xyz/anchor';
import { serializeTx } from '@repo/lib/src/program/tx';

import { GbProgram } from '@/lib/program';
import { errorHandler } from '@/lib/next';

export const POST = errorHandler<
  {
    puzzlePDA: string;
  },
  {
    tx: string;
  }
>(async function ({ puzzlePDA }) {
  const program = await GbProgram.new();
  const puzzle = await program.getPuzzle(new anchor.web3.PublicKey(puzzlePDA));
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
});
