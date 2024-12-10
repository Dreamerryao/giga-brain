import * as anchor from '@coral-xyz/anchor';

import { GbProgram } from '@/lib/program';
import { errorHandler } from '@/lib/next';

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
    signature: string;
  }
>(async function ({
  mint,
  tx,
  prompt,
  metadata,
  blockhashWithExpiryBlockHeight,
  commitment,
}) {
  const gbProgram = await GbProgram.new();
  const signature = await gbProgram.finalizeRecordAttemptWithPayer({
    mint: new anchor.web3.PublicKey(mint),
    tx,
    prompt,
    metadata,
    promptsVerifier: gbProgram.promptsVerifier,
    blockhashWithExpiryBlockHeight,
    commitment: commitment as anchor.web3.Commitment,
    confirmTx: false,
  });
  return {
    signature,
  };
});
