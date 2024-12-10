import * as anchor from '@coral-xyz/anchor';
import { NATIVE_MINT } from '@solana/spl-token';

import { BaseBot } from './lib/bot';
import { GIGA_MINT } from './lib/config';

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
    await this.createGame({
      puzzleAttemptTimeoutSeconds: Number(
        process.env.TEST_PUZZLE_ATTEMPT_TIMEOUT_SECONDS!
      ),
      puzzleAttemptFinalTimeoutSeconds: Number(
        process.env.TEST_PUZZLE_ATTEMPT_FINAL_TIMEOUT_SECONDS!
      ),
      maxAttempts: Number(process.env.TEST_MAX_ATTEMPTS!),
    });

    await this.createAdminTokenAccounts();

    await this.createPuzzleCurrency({
      mint: NATIVE_MINT,
      serviceFee: 0.2,
      minimumInitialPrize: 0.5,
      feeConfig: {
        baseFee: 0.01,
        maxFee: 2,
      },
    });

    await this.createPuzzleCurrency({
      mint: GIGA_MINT,
      serviceFee: 0,
      minimumInitialPrize: 25_000,
      feeConfig: {
        baseFee: 500,
        maxFee: 20_000,
      },
    });
  }

  async createGame({
    maxAttempts,
    puzzleAttemptTimeoutSeconds,
    puzzleAttemptFinalTimeoutSeconds,
  }: {
    maxAttempts: number;
    puzzleAttemptTimeoutSeconds: number;
    puzzleAttemptFinalTimeoutSeconds: number;
  }) {
    console.log('Updating game config');
    let create = false;
    try {
      await this.gbProgram.getGame();
    } catch (e) {
      if (
        (e as Error).message.includes('Account does not exist or has no data')
      ) {
        create = true;
      } else {
        throw e;
      }
    }

    await this.gbProgram.setGameConfigWithPayer({
      promptsVerifier: this.promptsVerifier.publicKey,
      puzzlesVerifier: this.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds,
      puzzleAttemptFinalTimeoutSeconds,
      maxAttempts,
      admin: this.admin,
      create,
    });
  }

  async createAdminTokenAccounts() {
    const ata = await this.gbProgram.getTokenAccountAddress(
      GIGA_MINT,
      this.admin.publicKey
    );
    console.log('creating admin token accounts:');
    console.log({
      admin: this.admin.publicKey.toBase58(),
      account: ata.toBase58(),
    });
    await this.gbProgram.getOrCreateTokenAccount(
      GIGA_MINT,
      this.admin.publicKey,
      this.admin
    );
  }

  async createPuzzleCurrency({
    mint,
    serviceFee,
    minimumInitialPrize,
    feeConfig,
  }: {
    mint: anchor.web3.PublicKey;
    serviceFee: number;
    minimumInitialPrize: number;
    feeConfig: {
      baseFee: number;
      maxFee: number;
    };
  }) {
    console.log('Updating currency config for ', mint.toBase58());
    const puzzleCurrencyPDA = this.gbProgram.getPuzzleCurrencyPDA({ mint });
    let create = false;
    try {
      await this.gbProgram.getPuzzleCurrency(puzzleCurrencyPDA);
    } catch (e) {
      if (
        (e as Error).message.includes('Account does not exist or has no data')
      ) {
        create = true;
      } else {
        throw e;
      }
    }

    await this.gbProgram.setPuzzleCurrencyConfigWithPayer({
      admin: this.admin,
      mint,
      serviceFee,
      minimumInitialPrize,
      feeConfig,
      create,
    });
  }
}

main().catch(console.error);

async function main() {
  const bot = await Bot.new();
  await bot.run();
}
