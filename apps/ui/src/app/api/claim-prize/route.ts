import * as anchor from '@coral-xyz/anchor';
import { serializeTx } from '@repo/lib/src/program/tx';
import { supabase } from '@repo/lib/src/supabase';

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
});
