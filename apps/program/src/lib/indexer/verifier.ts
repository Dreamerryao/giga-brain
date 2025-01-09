import * as anchor from '@coral-xyz/anchor';
import { eq, and, asc, isNotNull } from 'drizzle-orm';
import {
  type ExecEventFnOpts,
  type ExecPartiallyDecodedIxFnOpts,
} from 'solana-anchor-indexer/src';
import { utils as libLLM } from '@repo/lib/src/llm';

import { utils as programLLM } from '@/lib/llm/llm';
import { GbProgram } from '@/lib/program/program';
import { db as drizzleDb } from '@/db';
import { puzzleAttempt, verifierTxns } from '@/db/schema';

import { makeIndexer } from './utils/indexer';

export class VerifierIndexer {
  gbProgram: GbProgram;

  constructor({ gbProgram }: { gbProgram: GbProgram }) {
    this.gbProgram = gbProgram;
  }

  static async new({ gbProgram }: { gbProgram: GbProgram }) {
    const indexer = new VerifierIndexer({
      gbProgram,
    });

    return makeIndexer({
      gbProgram,
      txnsTable: verifierTxns,
      processIx: indexer.processIx.bind(indexer),
      processEvent: indexer.processEvent.bind(indexer),
    });
  }

  async processIx(opts: ExecPartiallyDecodedIxFnOpts) {
    switch (opts.ix.name) {
      case 'recordAttempt':
      case 'recordAttemptToken': {
        await this.handleRecordAttemptIx(opts);
        break;
      }
      default:
    }
  }

  async processEvent(_opts: ExecEventFnOpts) {}

  async handleRecordAttemptIx(opts: ExecPartiallyDecodedIxFnOpts) {
    const puzzlePubkey = opts.ix.namedAccounts.Puzzle.toString();
    const solverPubkey = opts.ix.namedAccounts.Solver.toString();

    const puzzleAccount = await this.gbProgram.getPuzzle(
      new anchor.web3.PublicKey(puzzlePubkey)
    );

    const systemPrompt = await this.gbProgram.getMessageFromHashBytes(
      puzzleAccount.promptHash
    );
    if (!systemPrompt) {
      throw new Error(
        `Puzzle(${puzzlePubkey.toString()}) system prompt not found`
      );
    }

    const latestUserPromptHash = puzzleAccount.status.attempted?.promptHash;
    if (!latestUserPromptHash) {
      console.log('Puzzle attempt was already evaluated. Skipping...');
      return;
    }
    const latestUserPrompt =
      await this.gbProgram.getMessageFromHashBytes(latestUserPromptHash);

    const latestUserMetadataHash = puzzleAccount.status.attempted?.metadataHash;
    const latestUserMetadata = latestUserMetadataHash
      ? await this.gbProgram.getMessageFromHashBytes(latestUserMetadataHash)
      : null;

    let myChat = false;
    if (latestUserMetadata) {
      try {
        const metadata = await libLLM.verifyAttemptMetadata(latestUserMetadata);
        myChat = metadata.myChat ?? false;
      } catch (e) {
        console.error('Error parsing metadata', e);
      }
    }

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(
      new anchor.web3.PublicKey(puzzlePubkey)
    );
    if (!puzzleRecord.model) {
      throw new Error(`Puzzle(${puzzlePubkey}) model not found`);
    }

    const myChatQuery = myChat
      ? eq(puzzleAttempt.solver, solverPubkey)
      : undefined;
    const attempts = await drizzleDb
      .select()
      .from(puzzleAttempt)
      .where(
        and(
          eq(puzzleAttempt.puzzle, puzzlePubkey),
          isNotNull(puzzleAttempt.response),
          myChatQuery
        )
      )
      .orderBy(asc(puzzleAttempt.id));

    const { approve, response } = await programLLM.evaluatePrompt({
      model: puzzleRecord.model,
      systemPrompt,
      pastUserPrompts: attempts.map((a) => ({
        prompt: a.prompt,
        response: a.response!,
      })),
      latestUserPrompt,
    });

    await this.gbProgram.resolveAttemptWithPayer({
      puzzlePDA: new anchor.web3.PublicKey(puzzlePubkey),
      response,
      puzzlesVerifier: this.gbProgram.puzzlesVerifier,
      approve,
    });
  }
}
