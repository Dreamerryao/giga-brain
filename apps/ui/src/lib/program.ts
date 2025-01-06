import * as anchor from '@coral-xyz/anchor';
import { BaseGbProgram, IDL } from '@repo/lib/src/program/program';
import { Gb } from '@repo/lib/src/program/gb';
import {
  getPromptsVerifierKey,
  getProvider,
} from '@repo/lib/src/program/provider';
import { supabase } from '@repo/lib/src/supabase';
import { toLamports } from '@repo/lib/src/bn';
import { mintTo } from '@solana/spl-token';

import { GIGA_MINT } from '@/config';

export class GbProgram extends BaseGbProgram {
  promptsVerifier: anchor.web3.Keypair;

  static async new() {
    const promptsVerifier = getPromptsVerifierKey();
    const provider = await getProvider(promptsVerifier);
    const program: anchor.Program<Gb> = new anchor.Program<Gb>(IDL, provider);
    return new GbProgram({ program, promptsVerifier });
  }

  constructor({
    program,
    promptsVerifier,
  }: {
    program: anchor.Program<Gb>;
    promptsVerifier: anchor.web3.Keypair;
  }) {
    super(program);
    this.promptsVerifier = promptsVerifier;
  }

  async storeMessage({ content, hash }: { content: string; hash: number[] }) {
    const { error } = await supabase
      .from('message')
      .upsert(
        { content, hash: this.getMessageBuffer(hash) },
        {
          onConflict: 'hash',
          ignoreDuplicates: false,
        }
      )
      .select();

    if (error) {
      throw new Error(error.message);
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
    const decimals = await this.getMintDecimals(mint);
    const tokenAccount = (
      await this.getOrCreateTokenAccount(mint, owner, this.promptsVerifier)
    ).address;
    const amountLamports = toLamports(amount, decimals);

    const confirmOpts: anchor.web3.ConfirmOptions = {
      skipPreflight: true,
      commitment: 'processed',
      preflightCommitment: 'processed',
      maxRetries: 1,
    };

    try {
      return await mintTo(
        this.program.provider.connection,
        this.promptsVerifier,
        mint,
        tokenAccount,
        this.promptsVerifier, // mint authority
        amountLamports.toNumber(),
        [],
        confirmOpts
      );
    } catch (error) {
      console.error(error);
      throw new Error('Failed to mint tokens');
    }
  }
}
