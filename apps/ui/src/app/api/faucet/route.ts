import * as anchor from '@coral-xyz/anchor';

import { errorHandler } from '@/lib/next';
import { GbProgram } from '@/lib/program';

const AMOUNT = 200_000;

export const POST = errorHandler<
  {
    pubkey: string;
  },
  {
    signature: string;
  }
>(async function ({ pubkey }) {
  const gbProgram = await GbProgram.new();
  try {
    const sig = await gbProgram.faucetToken({
      owner: new anchor.web3.PublicKey(pubkey),
      amount: AMOUNT,
    });
    return {
      signature: sig,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
});
