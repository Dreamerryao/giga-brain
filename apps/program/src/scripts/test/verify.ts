import * as anchor from '@coral-xyz/anchor';

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
    const pda = new anchor.web3.PublicKey(
      'H2eqRhZfbGd2EDpNiWNJUgLa3DpHhSGfmdjRz4h8RdkU'
    );

    const p = await this.gbProgram.getPuzzle(pda);

    console.log(p);
  }
}

main().catch(console.error);

async function main() {
  const bot = await Bot.new();
  await bot.run();
}
