import { closeAccount } from '@solana/spl-token';

import { BaseBot } from './lib/bot';
import { GIGA_MINT, TEST_ADMIN_KEY, TEST_CREATOR_KEY } from './lib/config';

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
    const owner = TEST_CREATOR_KEY;
    const account = await this.gbProgram.getTokenAccountAddress(
      GIGA_MINT,
      owner.publicKey
    );
    const balance = await this.gbProgram.getTokenAccountBalance(account);
    console.log({ owner: owner.publicKey.toBase58(), balance });
    await closeAccount(
      this.gbProgram.program.provider.connection,
      owner,
      account,
      TEST_ADMIN_KEY.publicKey,
      owner
    );
  }
}

main().catch(console.error);

async function main() {
  const bot = await Bot.new();
  await bot.run();
}
