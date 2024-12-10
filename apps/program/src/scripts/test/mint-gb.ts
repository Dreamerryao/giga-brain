import { createMint } from '@solana/spl-token';

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
    console.log(
      (
        await createMint(
          this.gbProgram.program.provider.connection,
          this.promptsVerifier,
          this.promptsVerifier.publicKey,
          this.promptsVerifier.publicKey,
          6
        )
      ).toString()
    );
  }
}

main().catch(console.error);

async function main() {
  const bot = await Bot.new();
  await bot.run();
}
