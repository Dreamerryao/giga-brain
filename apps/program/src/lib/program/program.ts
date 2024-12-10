import * as anchor from '@coral-xyz/anchor';
import { and, desc, eq } from 'drizzle-orm';
import { BaseGbProgram, IDL } from '@repo/lib/src/program/program';
import { Gb } from '@repo/lib/src/program/gb';
import {
  getKeyFromEnvOrFile,
  getPromptsVerifierKey,
  getProvider,
} from '@repo/lib/src/program/provider';

import {
  message,
  puzzle,
  game,
  puzzleCurrency,
  playerActivity,
  playerCurrencyStats,
  puzzleAttempt,
} from '@/db/schema';
import { db as drizzleDb } from '@/db';

export class GbProgram extends BaseGbProgram {
  promptsVerifier: anchor.web3.Keypair;
  puzzlesVerifier: anchor.web3.Keypair;

  static async new(provider?: anchor.AnchorProvider) {
    const promptsVerifier = getPromptsVerifierKey();
    const puzzlesVerifier = getPuzzlesVerifierKey();
    const program: anchor.Program<Gb> = new anchor.Program<Gb>(
      IDL,
      provider || (await getProvider(promptsVerifier))
    );
    return new GbProgram({
      program,
      promptsVerifier,
      puzzlesVerifier,
    });
  }

  constructor({
    program,
    promptsVerifier,
    puzzlesVerifier,
  }: {
    program: anchor.Program<Gb>;
    promptsVerifier: anchor.web3.Keypair;
    puzzlesVerifier: anchor.web3.Keypair;
  }) {
    super(program);
    this.promptsVerifier = promptsVerifier;
    this.puzzlesVerifier = puzzlesVerifier;
  }

  async getGameRecord() {
    const records = await drizzleDb.select().from(game).limit(2);
    if (records.length > 1) {
      throw new Error('Expected 1 game record, but got ' + records.length);
    }
    const record = records[0];
    if (!record) {
      throw new Error('Game record not found');
    }
    return record;
  }

  async getPuzzleRecord(puzzlePDA: anchor.web3.PublicKey) {
    const records = await drizzleDb
      .select()
      .from(puzzle)
      .where(eq(puzzle.publicKey, puzzlePDA.toBase58()))
      .limit(2);
    if (records.length > 1) {
      throw new Error(
        `Expected 1 puzzle record for puzzlePDA: ${puzzlePDA}, but got ${records.length}`
      );
    }
    const record = records[0];
    if (!record) {
      throw new Error(`Puzzle record not found for puzzlePDA: ${puzzlePDA}`);
    }
    return record;
  }

  async getPuzzleCurrencyRecordByMint(mint: anchor.web3.PublicKey) {
    const records = await drizzleDb
      .select()
      .from(puzzleCurrency)
      .where(eq(puzzleCurrency.mint, mint.toBase58()))
      .limit(2);
    if (records.length > 1) {
      throw new Error(
        `Expected 1 puzzle currency record for mint: ${mint}, but got ${records.length}`
      );
    }
    const record = records[0];
    if (!record) {
      throw new Error(`Puzzle currency record not found for mint: ${mint}`);
    }
    return record;
  }

  async getPuzzleRecordByNonce(nonce: number) {
    const records = await drizzleDb
      .select()
      .from(puzzle)
      .where(eq(puzzle.nonce, nonce))
      .limit(2);
    if (records.length > 1) {
      throw new Error(
        `Expected 1 puzzle record for nonce: ${nonce}, but got ${records.length}`
      );
    }
    const record = records[0];
    if (!record) {
      throw new Error(`Puzzle record not found for nonce: ${nonce}`);
    }
    return record;
  }

  async getPlayerActivityRecord(player: anchor.web3.PublicKey) {
    const records = await drizzleDb
      .select()
      .from(playerActivity)
      .where(eq(playerActivity.publicKey, player.toBase58()))
      .limit(2);
    if (records.length > 1) {
      throw new Error(
        `Expected 1 player activity record for player: ${player}, but got ${records.length}`
      );
    }
    const record = records[0];
    if (!record) {
      throw new Error(`Player activity record not found for player: ${player}`);
    }
    return record;
  }

  async getPlayerCurrencyStatsRecord({
    player,
    mint,
  }: {
    player: anchor.web3.PublicKey;
    mint: anchor.web3.PublicKey;
  }) {
    const records = await drizzleDb
      .select()
      .from(playerCurrencyStats)
      .where(
        and(
          eq(playerCurrencyStats.mint, mint.toBase58()),
          eq(playerCurrencyStats.player, player.toBase58())
        )
      )
      .limit(2);
    if (records.length > 1) {
      throw new Error(
        `Expected 1 player currency stats record for player: ${player} and mint: ${mint}, but got ${records.length}`
      );
    }
    const record = records[0];
    if (!record) {
      throw new Error(
        `Player currency stats record not found for player: ${player} and mint: ${mint}`
      );
    }
    return record;
  }

  async getPlayerCurrencyStatsRecordIfExists({
    player,
    mint,
  }: {
    player: anchor.web3.PublicKey;
    mint: anchor.web3.PublicKey;
  }) {
    const records = await drizzleDb
      .select()
      .from(playerCurrencyStats)
      .where(
        and(
          eq(playerCurrencyStats.mint, mint.toBase58()),
          eq(playerCurrencyStats.player, player.toBase58())
        )
      )
      .limit(2);
    if (records.length > 1) {
      throw new Error(
        `Expected 1 player currency stats record for player: ${player} and mint: ${mint}, but got ${records.length}`
      );
    }
    const record = records[0];
    return record;
  }

  async getLatestPuzzleAttemptRecord({
    puzzle,
    solver,
  }: {
    puzzle: anchor.web3.PublicKey;
    solver: anchor.web3.PublicKey;
  }) {
    const [record] = await drizzleDb
      .select()
      .from(puzzleAttempt)
      .where(eq(puzzleAttempt.solver, solver.toString()))
      .orderBy(desc(puzzleAttempt.id))
      .limit(1);
    if (!record) {
      throw new Error(
        `Latest puzzle attempt record not found for puzzle: ${puzzle}`
      );
    }
    return record;
  }

  async storeMessage({ content, hash }: { content: string; hash: number[] }) {
    await drizzleDb
      .insert(message)
      .values({ content, hash: this.getMessageBuffer(hash) })
      .onConflictDoNothing();
  }

  async getMessageFromString(hashBase64: string) {
    const [record] = await drizzleDb
      .select()
      .from(message)
      .where(eq(message.hash, hashBase64))
      .limit(1);
    return record?.content;
  }

  getMessageFromHashBytes(hash: number[]) {
    return this.getMessageFromString(this.getMessageBuffer(hash));
  }
}

function getPuzzlesVerifierKey() {
  return getKeyFromEnvOrFile('PUZZLES_VERIFIER_KEY');
}
