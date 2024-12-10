import * as anchor from '@coral-xyz/anchor';
import { fromLamports } from '@repo/lib/src/bn';

import { BaseBot } from './lib/bot';

class Bot extends BaseBot {
  static async new() {
    const baseBot = await super.new();
    return new Bot({
      admin: baseBot.admin,
      promptsVerifier: baseBot.promptsVerifier,
      puzzlesVerifier: baseBot.puzzlesVerifier,
      gbProgram: baseBot.gbProgram,
    });
  }
  async runLogic() {
    const puzzlePDA = new anchor.web3.PublicKey(
      'H2eqRhZfbGd2EDpNiWNJUgLa3DpHhSGfmdjRz4h8RdkU'
    );
    const puzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    const fee = await this.gbProgram.getCurrentFee({
      puzzlePDA,
    });
    const decimals = await this.gbProgram.getMintDecimals(puzzle.currencyMint);

    console.log({
      feeNum: fee.toNumber(),
      feeString: fromLamports(fee, decimals),
    });
  }
}

main().catch(console.error);

async function main() {
  const bot = await Bot.new();
  await bot.run();
}
