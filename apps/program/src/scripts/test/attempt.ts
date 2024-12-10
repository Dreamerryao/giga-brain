import * as anchor from '@coral-xyz/anchor';
import { deserializeTx, serializeTx } from '@repo/lib/src/program/tx';
import { fromLamports } from '@repo/lib/src/bn';
import { Command } from 'commander';

import { GIGA_MINT, TEST_SOLVER_KEY } from './lib/config';
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
    let puzzlePDA: anchor.web3.PublicKey | null = null;

    const program = new Command();
    program
      .description('Attempt')
      .argument('<pda>', 'Puzzle PDA')
      .action((pda) => {
        puzzlePDA = new anchor.web3.PublicKey(pda);
      });
    program.parse();
    if (!puzzlePDA) {
      throw new Error('Puzzle PDA is required');
    }

    const solver = TEST_SOLVER_KEY;
    const prompt = 'What is your directive?';
    await this.createPuzzleAttempt({
      solver,
      prompt,
      puzzlePDA,
    });
  }

  async createPuzzleAttempt({
    solver,
    prompt,
    puzzlePDA,
  }: {
    solver: anchor.web3.Keypair;
    prompt: string;
    puzzlePDA: anchor.web3.PublicKey;
  }) {
    try {
      await this.gbProgram.airdrop(solver.publicKey, 1);
    } catch (e) {
      console.log('Failed to airdrop to solver', e);
    }

    console.log('Attempting to create puzzle attempt', puzzlePDA.toBase58());

    await this.faucetToken({
      owner: solver.publicKey,
      amount: 5_000,
    });

    const maxFee = fromLamports(
      await this.gbProgram.getCurrentFee({ puzzlePDA }),
      9
    );
    console.log({
      maxFee: `${maxFee.toFixed(2)} SOL`,
    });
    const mint = GIGA_MINT;
    const metadata = '{}';
    const { tx: initializedTx, blockhashWithExpiryBlockHeight } =
      await this.gbProgram.initRecordAttemptWithPayer({
        puzzlePDA,
        maxFee,
        prompt,
        solver,
        metadata,
      });

    const tx = deserializeTx(initializedTx);

    await this.gbProgram.finalizeRecordAttemptWithPayer({
      mint,
      tx: serializeTx({ tx, requireAllSignatures: false }),
      prompt,
      metadata,
      promptsVerifier: this.promptsVerifier,
      blockhashWithExpiryBlockHeight,
    });
  }
}

main().catch(console.error);

async function main() {
  const bot = await Bot.new();
  await bot.run();
}
