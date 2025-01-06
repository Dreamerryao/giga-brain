import * as anchor from '@coral-xyz/anchor';
import { deserializeTx, serializeTx } from '@repo/lib/src/program/tx';
import { fromLamports } from '@repo/lib/src/bn';

import { GIGA_MINT, TEST_CREATOR_KEY } from './lib/config';
import * as cryptoGuard9000 from './samples/crypto-guard-9000';
import * as freysa from './samples/freysa';
import * as logicalGuard from './samples/logical-guard';
import * as multiLayerProtection from './samples/multi-layer-protection';
import * as paranoidGuard from './samples/paranoid-guard';
import * as sentinel7 from './samples/sentinel-7';
import { BaseBot } from './lib/bot';

const PROMPTS = [
  cryptoGuard9000,
  freysa,
  logicalGuard,
  multiLayerProtection,
  paranoidGuard,
  sentinel7,
];

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
    const creator = TEST_CREATOR_KEY;

    for (const prompt of PROMPTS) {
      await this.createPuzzle({
        creator,
        name: prompt.name,
        prompt: prompt.systemPrompt,
        mint: GIGA_MINT,
      });
    }
  }

  async createPuzzle({
    creator,
    prompt,
    name,
    mint,
  }: {
    creator: anchor.web3.Keypair;
    prompt: string;
    name: string;
    mint: anchor.web3.PublicKey;
  }) {
    try {
      await this.gbProgram.airdrop(creator.publicKey, 1);
    } catch (e) {
      console.log('Failed to airdrop to creator', e);
    }

    const puzzleNonce = this.gbProgram.getRandomPuzzleNonce();
    const puzzlePDA = this.gbProgram.getPuzzlePDA({
      creator: creator.publicKey,
      nonce: puzzleNonce,
    });

    console.log('Attempting to create puzzle', puzzlePDA.toBase58());
    const avatarUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${name}`;
    const decimals = await this.gbProgram.getMintDecimals(mint);
    const game = await this.gbProgram.getGame();
    const puzzleCurrencyPDA = this.gbProgram.getPuzzleCurrencyPDA({
      mint,
    });
    const puzzleCurrency =
      await this.gbProgram.getPuzzleCurrency(puzzleCurrencyPDA);
    const metadata = '{}';
    const initialPrize = fromLamports(
      puzzleCurrency.minimumInitialPrize,
      decimals
    );

    await this.faucetToken({
      owner: creator.publicKey,
      amount: initialPrize,
    });

    const { tx: initializedTx, blockhashWithExpiryBlockHeight } =
      await this.gbProgram.initCreatePuzzleWithPayer({
        puzzlePDA,
        prizeAmount: initialPrize,
        prompt,
        puzzleNonce,
        name,
        avatarUrl,
        creator,
        model: 'gpt-4o-mini',
        mint,
        metadata,
        baseFee: fromLamports(puzzleCurrency.feeConfig.baseFee, decimals),
        maxFee: fromLamports(puzzleCurrency.feeConfig.maxFee, decimals),
        maxAttempts: game.maxAttempts,
        attemptTimeoutSeconds: game.puzzleAttemptTimeoutSeconds.toNumber(),
        attemptFinalTimeoutSeconds:
          game.puzzleAttemptFinalTimeoutSeconds.toNumber(),
      });

    const tx = deserializeTx(initializedTx);

    await this.gbProgram.finalizeCreatePuzzleWithPayer({
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
