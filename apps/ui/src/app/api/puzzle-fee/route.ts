import * as anchor from '@coral-xyz/anchor';

import { errorHandler } from '@/lib/next';
import { GbProgram } from '@/lib/program';

export const POST = errorHandler<
  {
    puzzlePDA: string;
  },
  {
    fee: number;
  }
>(async function ({ puzzlePDA }) {
  const gbProgram = await GbProgram.new();
  const fee = await gbProgram.getCurrentFee({
    puzzlePDA: new anchor.web3.PublicKey(puzzlePDA),
  });
  return {
    fee: fee.toNumber(),
  };
});
