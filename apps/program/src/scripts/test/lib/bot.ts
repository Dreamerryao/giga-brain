import * as anchor from '@coral-xyz/anchor';
import { getProvider } from '@repo/lib/src/program/provider';
import { mintTo } from '@solana/spl-token';
import { toLamports } from '@repo/lib/src/bn';

import { GbProgram } from '@/lib/program/program';
import { disconnect as disconnectDrizzleDb } from '@/db';

import {
  GIGA_MINT,
  TEST_ADMIN_KEY,
  TEST_PROMPTS_VERIFIER_KEY,
  TEST_PUZZLES_VERIFIER_KEY,
} from './config';

export class BaseBot {
  admin: anchor.web3.Keypair;
  promptsVerifier: anchor.web3.Keypair;
  puzzlesVerifier: anchor.web3.Keypair;
  gbProgram: GbProgram;

  constructor({
    admin,
    promptsVerifier,
    puzzlesVerifier,
    gbProgram,
  }: {
    admin: anchor.web3.Keypair;
    promptsVerifier: anchor.web3.Keypair;
    puzzlesVerifier: anchor.web3.Keypair;
    gbProgram: GbProgram;
  }) {
    this.admin = admin;
    this.promptsVerifier = promptsVerifier;
    this.puzzlesVerifier = puzzlesVerifier;
    this.gbProgram = gbProgram;
  }

  static async new() {
    const admin = TEST_ADMIN_KEY;
    const provider = await getProvider(admin);
    const gbProgram = await GbProgram.new(provider);
    const promptsVerifier = TEST_PROMPTS_VERIFIER_KEY;
    const puzzlesVerifier = TEST_PUZZLES_VERIFIER_KEY;
    const bot = new BaseBot({
      admin,
      promptsVerifier,
      puzzlesVerifier,
      gbProgram,
    });
    return bot;
  }

  async run() {
    try {
      // while (true) {
      try {
        await this.runLogic();
      } catch (e) {
        console.error(e);
      }
      // await sleep(30_000);
      // }
    } catch (e) {
      console.error(e);
    } finally {
      await disconnectDrizzleDb();
    }
  }

  async faucetToken({
    owner,
    amount,
  }: {
    owner: anchor.web3.PublicKey;
    amount: number;
  }) {
    const mint = GIGA_MINT;
    const decimals = await this.gbProgram.getMintDecimals(mint);
    const tokenAccount = (
      await this.gbProgram.getOrCreateTokenAccount(
        mint,
        owner,
        this.promptsVerifier
      )
    ).address;
    const amountLamports = toLamports(amount, decimals);

    try {
      await mintTo(
        this.gbProgram.program.provider.connection,
        this.promptsVerifier,
        mint,
        tokenAccount,
        this.promptsVerifier, // mint authority
        amountLamports.toNumber()
      );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to mint tokens');
    }
  }

  async runLogic() {
    throw new Error('Not implemented');
  }
}
