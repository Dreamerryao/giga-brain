import * as anchor from '@coral-xyz/anchor';
import { eq, sql, and, desc } from 'drizzle-orm';
import { NATIVE_MINT } from '@solana/spl-token';
import {
  type ExecEventFnOpts,
  type ExecPartiallyDecodedIxFnOpts,
} from 'solana-anchor-indexer';

import { GbProgram } from '@/lib/program/program';
import { db as drizzleDb } from '@/db';
import {
  game,
  puzzle,
  puzzleAttempt,
  puzzleCurrency,
  puzzleMessage,
  txns,
  playerActivity,
  playerActivityLog,
  playerCurrencyStats,
} from '@/db/schema';

import { makeIndexer } from './utils/indexer';

export class Indexer {
  gbProgram: GbProgram;

  constructor({ gbProgram }: { gbProgram: GbProgram }) {
    this.gbProgram = gbProgram;
  }

  static async new({ gbProgram }: { gbProgram: GbProgram }) {
    const indexer = new Indexer({
      gbProgram,
    });

    return makeIndexer({
      gbProgram,
      txnsTable: txns,
      processIx: indexer.processIx.bind(indexer),
      processEvent: indexer.processEvent.bind(indexer),
    });
  }

  async processIx(opts: ExecPartiallyDecodedIxFnOpts) {
    switch (opts.ix.name) {
      case 'initialize': {
        await this.handleSetGameConfigIx(opts, true);
        break;
      }
      case 'setGameConfig': {
        await this.handleSetGameConfigIx(opts, false);
        break;
      }
      case 'createPuzzleCurrencyConfig': {
        await this.handleSetPuzzleCurrencyConfigIx(opts, true);
        break;
      }
      case 'setPuzzleCurrencyConfig': {
        await this.handleSetPuzzleCurrencyConfigIx(opts, false);
        break;
      }
      case 'transferAdmin': {
        break;
      }
      case 'createPuzzle':
      case 'createPuzzleToken': {
        await this.handleCreatePuzzleIx(opts);
        break;
      }
      case 'recordAttempt':
      case 'recordAttemptToken': {
        await this.handleRecordAttemptIx(opts);
        break;
      }
      case 'approveTransfer':
      case 'approveTransferToken': {
        await this.handleApproveTransferIx(opts);
        break;
      }
      case 'rejectTransfer': {
        await this.handleRejectTransferIx(opts);
        break;
      }
      case 'claimPrize':
      case 'claimPrizeToken': {
        await this.handleClaimPrizeIx(opts);
        break;
      }
      case 'creatorClaimTimeout':
      case 'creatorClaimTimeoutToken': {
        await this.handleClaimTimeoutIx(opts);
        break;
      }
      case 'adminClaimTimeout':
      case 'adminClaimTimeoutToken': {
        await this.handleClaimTimeoutIx(opts);
        break;
      }

      default:
        throw new Error(`unknown instruction: ${opts.ix.name}`);
    }
  }

  async processEvent(opts: ExecEventFnOpts) {
    switch (opts.event.name) {
      case 'puzzleAttempted': {
        await this.handlePuzzleAttemptedEvent(opts);
        break;
      }
      case 'puzzleAttemptRejected': {
        await this.handlePuzzleAttemptRejectedEvent(opts);
        break;
      }
      case 'puzzleSolved': {
        await this.handlePuzzleSolvedEvent(opts);
        break;
      }
      case 'puzzleTimedOut': {
        await this.handlePuzzleTimedOutEvent(opts);
        break;
      }
      case 'puzzleFinalTimerStarted': {
        await this.handlePuzzleFinalTimerStartedEvent(opts);
        break;
      }
      default:
        throw new Error(`unknown event: ${opts.event.name}`);
    }
  }

  async handleSetGameConfigIx(
    opts: ExecPartiallyDecodedIxFnOpts,
    create: boolean
  ) {
    const gamePubkey = opts.ix.namedAccounts.Game.toString();
    const promptsVerifierPubkey =
      opts.ix.namedAccounts['Prompts Verifier'].toString();
    const puzzlesVerifierPubkey =
      opts.ix.namedAccounts['Puzzles Verifier'].toString();
    const {
      args: {
        puzzleAttemptTimeoutSeconds,
        puzzleAttemptFinalTimeoutSeconds,
        maxAttempts,
      },
    } = opts.ix.data as {
      args: {
        puzzleAttemptTimeoutSeconds: anchor.BN;
        puzzleAttemptFinalTimeoutSeconds: anchor.BN;
        maxAttempts: number;
      };
    };

    if (create) {
      await drizzleDb.transaction(async (tx) => {
        const adminPubkey = opts.ix.namedAccounts.Admin.toString();

        await tx
          .insert(game)
          .values({
            publicKey: gamePubkey,
            promptsVerifier: promptsVerifierPubkey,
            puzzlesVerifier: puzzlesVerifierPubkey,
            admin: adminPubkey,
            puzzleAttemptTimeoutSeconds: puzzleAttemptTimeoutSeconds.toNumber(),
            puzzleAttemptFinalTimeoutSeconds:
              puzzleAttemptFinalTimeoutSeconds.toNumber(),
            maxAttempts,
          })
          .onConflictDoNothing();
      });
    } else {
      await drizzleDb.transaction(async (tx) => {
        await tx.update(game).set({
          promptsVerifier: promptsVerifierPubkey,
          puzzlesVerifier: puzzlesVerifierPubkey,
          puzzleAttemptTimeoutSeconds: puzzleAttemptTimeoutSeconds.toNumber(),
          puzzleAttemptFinalTimeoutSeconds:
            puzzleAttemptFinalTimeoutSeconds.toNumber(),
          maxAttempts,
        });
      });
    }
  }

  async handleSetPuzzleCurrencyConfigIx(
    opts: ExecPartiallyDecodedIxFnOpts,
    create: boolean
  ) {
    const mintPubkey = opts.ix.namedAccounts.Mint.toString();

    const {
      args: { minimumInitialPrize, serviceFeeBps, feeConfig },
    } = opts.ix.data as {
      args: {
        minimumInitialPrize: anchor.BN;
        serviceFeeBps: number;
        feeConfig: {
          baseFee: anchor.BN;
          maxFee: anchor.BN;
        };
      };
    };

    if (create) {
      const decimals = await this.gbProgram.getMintDecimals(
        new anchor.web3.PublicKey(mintPubkey)
      );

      await drizzleDb.transaction(async (tx) => {
        await tx
          .insert(puzzleCurrency)
          .values({
            mint: mintPubkey,
            decimals,
            serviceFeeBps: serviceFeeBps,
            minimumInitialPrize: minimumInitialPrize.toNumber(),
            baseFee: feeConfig.baseFee.toNumber(),
            maxFee: feeConfig.maxFee.toNumber(),
          })
          .onConflictDoNothing();
      });
    } else {
      await drizzleDb.transaction(async (tx) => {
        await tx
          .update(puzzleCurrency)
          .set({
            serviceFeeBps: serviceFeeBps,
            minimumInitialPrize: minimumInitialPrize.toNumber(),
            baseFee: feeConfig.baseFee.toNumber(),
            maxFee: feeConfig.maxFee.toNumber(),
          })
          .where(eq(puzzleCurrency.mint, mintPubkey));
      });
    }
  }

  async handleCreatePuzzleIx(opts: ExecPartiallyDecodedIxFnOpts) {
    const puzzlePubkey = opts.ix.namedAccounts.Puzzle.toString();
    const creatorPubkey = opts.ix.namedAccounts.Creator.toString();
    const mintPubkey = (opts.ix.namedAccounts.Mint || NATIVE_MINT).toString();

    const {
      puzzleNonce: puzzleNonceBN,
      prizeAmount: prizeAmountBN,
      promptHash,
      avatarUrl,
      name,
      model,
      maxAttempts,
      metadataHash,
      baseFee,
      maxFee,
      attemptTimeoutSeconds,
      attemptFinalTimeoutSeconds,
    } = opts.ix.data as {
      puzzleNonce: anchor.BN;
      prizeAmount: anchor.BN;
      promptHash: Array<number>;
      avatarUrl: string;
      name: string;
      model: string;
      maxAttempts: number;
      metadataHash: Array<number>;
      baseFee: anchor.BN;
      maxFee: anchor.BN;
      attemptTimeoutSeconds: anchor.BN;
      attemptFinalTimeoutSeconds: anchor.BN;
    };

    const puzzleNonce = puzzleNonceBN.toNumber();
    const prizeAmount = prizeAmountBN.toNumber();

    const prompt = await this.gbProgram.getMessageFromHashBytes(promptHash);
    const metadata = await this.gbProgram.getMessageFromHashBytes(metadataHash);

    const currentFee = (
      await this.gbProgram.getCurrentFee({
        puzzlePDA: new anchor.web3.PublicKey(puzzlePubkey),
      })
    ).toNumber();

    const puzzleCurrencyRecord =
      await this.gbProgram.getPuzzleCurrencyRecordByMint(
        new anchor.web3.PublicKey(mintPubkey)
      );

    await drizzleDb.transaction(async (tx) => {
      await tx.update(game).set({
        totalPuzzlesCreated: sql`${game.totalPuzzlesCreated} + 1`,
      });

      await tx
        .update(puzzleCurrency)
        .set({
          totalPrizesEscrowed: sql`${puzzleCurrency.totalPrizesEscrowed} + ${prizeAmount}`,
        })
        .where(eq(puzzleCurrency.mint, mintPubkey));

      await tx.insert(puzzle).values({
        publicKey: puzzlePubkey,
        creator: creatorPubkey,
        status: 'Active',
        initialPrize: prizeAmount,
        currencyMint: mintPubkey,
        currencyServiceFeeBps: puzzleCurrencyRecord.serviceFeeBps,
        currencyBaseFee: baseFee.toNumber(),
        currencyMaxFee: maxFee.toNumber(),
        maxAttempts,
        attemptTimeoutSeconds: attemptTimeoutSeconds.toNumber(),
        attemptFinalTimeoutSeconds: attemptFinalTimeoutSeconds.toNumber(),
        prompt,
        nonce: puzzleNonce,
        currentFee,
        avatarUrl,
        name,
        model,
        metadata,
      });

      await tx
        .insert(playerActivity)
        .values({
          publicKey: creatorPubkey,
          totalPuzzlesCreated: 1,
        })
        .onConflictDoUpdate({
          target: playerActivity.publicKey,
          set: {
            totalPuzzlesCreated: sql`${playerActivity.totalPuzzlesCreated} + 1`,
            lastActivityAt: new Date(),
          },
        });

      await tx.insert(playerActivityLog).values({
        player: creatorPubkey,
        event: 'PuzzleCreated',
        puzzle: puzzlePubkey,
        data: JSON.stringify({}),
      });
    });
  }

  async handleRecordAttemptIx(opts: ExecPartiallyDecodedIxFnOpts) {
    const puzzlePubkey = opts.ix.namedAccounts.Puzzle.toString();
    const solverPubkey = opts.ix.namedAccounts.Solver.toString();
    const { promptHash: userPromptHash, maxFee } = opts.ix.data as {
      promptHash: Array<number>;
      maxFee: anchor.BN;
    };

    const userPrompt =
      await this.gbProgram.getMessageFromHashBytes(userPromptHash);

    const nextFee = (
      await this.gbProgram.getCurrentFee({
        puzzlePDA: new anchor.web3.PublicKey(puzzlePubkey),
      })
    ).toNumber();

    await drizzleDb.transaction(async (tx) => {
      await tx.update(game).set({
        totalAttemptsMade: sql`${game.totalAttemptsMade} + 1`,
      });

      await tx
        .insert(playerActivity)
        .values({
          publicKey: solverPubkey,
          totalAttemptsMade: 1,
        })
        .onConflictDoUpdate({
          target: playerActivity.publicKey,
          set: {
            totalAttemptsMade: sql`${playerActivity.totalAttemptsMade} + 1`,
            lastActivityAt: new Date(),
          },
        });

      await tx
        .update(puzzle)
        .set({
          totalAttemptsMade: sql`${puzzle.totalAttemptsMade} + 1`,
          lastAttemptSolver: solverPubkey,
          lastAttemptPrompt: userPrompt,
          status: 'Attempted',
          currentFee: nextFee,
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));

      await tx.insert(puzzleAttempt).values({
        puzzle: puzzlePubkey,
        solver: solverPubkey,
        prompt: userPrompt,
      });

      await tx.insert(puzzleMessage).values({
        puzzle: puzzlePubkey,
        solver: solverPubkey,
        content: userPrompt,
        fee: maxFee.toNumber(),
        isUser: true,
      });

      await tx.insert(playerActivityLog).values({
        player: solverPubkey,
        event: 'PuzzleAttempted',
        puzzle: puzzlePubkey,
        data: JSON.stringify({ fee: maxFee.toNumber() }),
      });
    });
  }

  async handleApproveTransferIx(opts: ExecPartiallyDecodedIxFnOpts) {
    const puzzlePubkey = opts.ix.namedAccounts.Puzzle.toString();

    const { responseHash } = opts.ix.data as {
      responseHash: Array<number>;
    };

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(
      new anchor.web3.PublicKey(puzzlePubkey)
    );

    const solverPubkey = puzzleRecord.lastAttemptSolver!;

    // get latest solver puzzle attempt
    const [latestPuzzleAttempt] = await drizzleDb
      .select()
      .from(puzzleAttempt)
      .where(
        and(
          eq(puzzleAttempt.solver, solverPubkey),
          eq(puzzleAttempt.puzzle, puzzlePubkey)
        )
      )
      .orderBy(desc(puzzleAttempt.id))
      .limit(1);
    if (!latestPuzzleAttempt) {
      throw new Error('latest puzzle attempt not found');
    }

    await drizzleDb.transaction(async (tx) => {
      await tx.update(game).set({
        totalPuzzlesSolved: sql`${game.totalPuzzlesSolved} + 1`,
      });

      await tx
        .update(puzzle)
        .set({
          status: 'ApprovedTransfer',
          solver: solverPubkey,
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));

      await tx
        .update(playerActivity)
        .set({
          totalPuzzlesSolved: sql`${playerActivity.totalPuzzlesSolved} + 1`,
        })
        .where(eq(playerActivity.publicKey, solverPubkey));

      const response =
        await this.gbProgram.getMessageFromHashBytes(responseHash);

      await tx
        .update(puzzleAttempt)
        .set({
          response,
        })
        .where(eq(puzzleAttempt.id, latestPuzzleAttempt.id));

      await tx.insert(puzzleMessage).values({
        puzzle: puzzlePubkey,
        solver: solverPubkey,
        content: response,
        fee: 0,
        isUser: false,
        isWinner: true,
      });

      const [latestPuzzleMessage] = await drizzleDb
        .select()
        .from(puzzleMessage)
        .where(eq(puzzleMessage.puzzle, puzzlePubkey))
        .orderBy(desc(puzzleMessage.id))
        .limit(1);
      if (!latestPuzzleMessage) {
        throw new Error('latest puzzle message not found');
      }

      await tx
        .update(puzzleMessage)
        .set({
          isWinner: true,
        })
        .where(eq(puzzleMessage.id, latestPuzzleMessage.id));

      await tx.insert(playerActivityLog).values({
        player: solverPubkey,
        event: 'PuzzleApprovedTransfer',
        puzzle: puzzlePubkey,
        data: JSON.stringify({}),
      });
    });
  }

  async handleRejectTransferIx(opts: ExecPartiallyDecodedIxFnOpts) {
    const puzzlePubkey = opts.ix.namedAccounts.Puzzle.toString();

    const { responseHash } = opts.ix.data as {
      responseHash: Array<number>;
    };

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(
      new anchor.web3.PublicKey(puzzlePubkey)
    );

    const solverPubkey = puzzleRecord.lastAttemptSolver!;

    // get latest solver puzzle attempt
    const [latestPuzzleAttempt] = await drizzleDb
      .select()
      .from(puzzleAttempt)
      .where(
        and(
          eq(puzzleAttempt.solver, solverPubkey),
          eq(puzzleAttempt.puzzle, puzzlePubkey)
        )
      )
      .orderBy(desc(puzzleAttempt.id))
      .limit(1);

    if (!latestPuzzleAttempt) {
      throw new Error('latest puzzle attempt not found');
    }

    const response = await this.gbProgram.getMessageFromHashBytes(responseHash);

    // console.log({
    //   hash: this.gbProgram.getMessageBuffer(responseHash),
    //   content: response,
    // });

    await drizzleDb.transaction(async (tx) => {
      await tx
        .update(puzzleAttempt)
        .set({
          response,
        })
        .where(eq(puzzleAttempt.id, latestPuzzleAttempt.id));

      await tx
        .update(puzzle)
        .set({
          status: 'Active',
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));

      await tx.insert(puzzleMessage).values({
        puzzle: puzzlePubkey,
        solver: solverPubkey,
        content: response,
        fee: 0,
        isUser: false,
      });

      await tx.insert(playerActivityLog).values({
        player: solverPubkey,
        event: 'PuzzleRejectedTransfer',
        puzzle: puzzlePubkey,
        data: JSON.stringify({}),
      });
    });
  }

  async handleClaimPrizeIx(opts: ExecPartiallyDecodedIxFnOpts) {
    const puzzlePubkey = opts.ix.namedAccounts.Puzzle.toString();

    await drizzleDb.transaction(async (tx) => {
      await tx
        .update(puzzle)
        .set({
          status: 'Completed',
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));
    });
  }

  async handleClaimTimeoutIx(opts: ExecPartiallyDecodedIxFnOpts) {
    const puzzlePubkey = opts.ix.namedAccounts.Puzzle.toString();

    await drizzleDb.transaction(async (tx) => {
      await tx
        .update(puzzle)
        .set({
          status: 'TimedOut',
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));
    });
  }

  async handlePuzzleAttemptedEvent({ event: { data } }: ExecEventFnOpts) {
    const {
      puzzle: puzzlePubkey,
      fee: fee16,
      timestamp: timestampString,
    } = data as {
      puzzle: string;
      fee: string;
      timestamp: string;
    };

    const fee = parseInt(fee16);
    const timestamp = parseInt(timestampString);

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(
      new anchor.web3.PublicKey(puzzlePubkey)
    );
    const solverPubkey = puzzleRecord.lastAttemptSolver!;

    const playerCurrencyStatsRecord =
      await this.gbProgram.getPlayerCurrencyStatsRecordIfExists({
        player: new anchor.web3.PublicKey(solverPubkey),
        mint: new anchor.web3.PublicKey(puzzleRecord.currencyMint),
      });

    await drizzleDb.transaction(async (tx) => {
      await tx
        .update(puzzleCurrency)
        .set({
          totalFeesPaid: sql`${puzzleCurrency.totalFeesPaid} + ${fee}`,
        })
        .where(eq(puzzleCurrency.mint, puzzleRecord.currencyMint));

      await tx
        .update(puzzle)
        .set({
          lastAttemptTimestamp: timestamp,
          totalFeesPaid: sql`${puzzle.totalFeesPaid} + ${fee}`,
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));

      if (playerCurrencyStatsRecord) {
        await tx
          .update(playerCurrencyStats)
          .set({
            totalFeesPaid: sql`${playerCurrencyStats.totalFeesPaid} + ${fee}`,
          })
          .where(
            and(
              eq(playerCurrencyStats.player, solverPubkey),
              eq(playerCurrencyStats.mint, puzzleRecord.currencyMint)
            )
          );
      } else {
        await tx.insert(playerCurrencyStats).values({
          player: solverPubkey,
          mint: puzzleRecord.currencyMint,
          totalFeesPaid: fee,
        });
      }
    });
  }

  async handlePuzzleAttemptRejectedEvent({ event: { data } }: ExecEventFnOpts) {
    const { puzzle: puzzlePubkey, timestamp: timestampString } = data as {
      puzzle: string;
      timestamp: string;
    };
    const timestamp = parseInt(timestampString);

    await drizzleDb.transaction(async (tx) => {
      await tx
        .update(puzzle)
        .set({
          lastResolvedAt: timestamp,
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));
    });
  }

  async handlePuzzleSolvedEvent({ event: { data } }: ExecEventFnOpts) {
    const {
      puzzle: puzzlePubkey,
      solvedAt: solvedAtString,
      solverShare: solverShareString,
      serviceShare: serviceShareString,
    } = data as {
      puzzle: string;
      solvedAt: string;
      solverShare: string;
      serviceShare: string;
    };

    const solvedAt = parseInt(solvedAtString);
    const solverShare = parseInt(solverShareString);
    const serviceShare = parseInt(serviceShareString);

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(
      new anchor.web3.PublicKey(puzzlePubkey)
    );
    const solverPubkey = puzzleRecord.solver!;
    const playerCurrencyStatsRecord =
      await this.gbProgram.getPlayerCurrencyStatsRecordIfExists({
        player: new anchor.web3.PublicKey(solverPubkey),
        mint: new anchor.web3.PublicKey(puzzleRecord.currencyMint),
      });

    await drizzleDb.transaction(async (tx) => {
      await tx
        .update(puzzleCurrency)
        .set({
          totalPuzzlesSolvedValue: sql`${puzzleCurrency.totalPuzzlesSolvedValue} + ${solverShare}`,
          totalServiceFeesPaid: sql`${puzzleCurrency.totalServiceFeesPaid} + ${serviceShare}`,
        })
        .where(eq(puzzleCurrency.mint, puzzleRecord.currencyMint));

      await tx
        .update(puzzle)
        .set({
          solvedAt,
          solverShare,
          serviceShare,
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));

      if (playerCurrencyStatsRecord) {
        await tx
          .update(playerCurrencyStats)
          .set({
            totalPuzzlesSolvedValue: sql`${playerCurrencyStats.totalPuzzlesSolvedValue} + ${solverShare}`,
          })
          .where(
            and(
              eq(playerCurrencyStats.player, solverPubkey),
              eq(playerCurrencyStats.mint, puzzleRecord.currencyMint)
            )
          );
      } else {
        await tx.insert(playerCurrencyStats).values({
          player: solverPubkey,
          mint: puzzleRecord.currencyMint,
          totalPuzzlesSolvedValue: solverShare,
        });
      }

      await tx.insert(playerActivityLog).values({
        player: solverPubkey,
        event: 'PuzzleClaimedPrize',
        puzzle: puzzlePubkey,
        data: JSON.stringify({
          solvedAt,
          solverShare,
          serviceShare,
        }),
      });
    });
  }

  async handlePuzzleTimedOutEvent({ event: { data } }: ExecEventFnOpts) {
    const {
      puzzle: puzzlePubkey,
      creatorShare: creatorShareString,
      serviceShare: serviceShareString,
    } = data as {
      puzzle: string;
      creatorShare: string;
      serviceShare: string;
    };

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(
      new anchor.web3.PublicKey(puzzlePubkey)
    );
    const creatorPubkey = puzzleRecord.creator!;
    const creatorShare = parseInt(creatorShareString);
    const serviceShare = parseInt(serviceShareString);

    const playerCurrencyStatsRecord =
      await this.gbProgram.getPlayerCurrencyStatsRecordIfExists({
        player: new anchor.web3.PublicKey(creatorPubkey),
        mint: new anchor.web3.PublicKey(puzzleRecord.currencyMint),
      });

    await drizzleDb.transaction(async (tx) => {
      await tx.update(game).set({
        totalPuzzlesTimedOut: sql`${game.totalPuzzlesTimedOut} + 1`,
      });

      await tx
        .update(puzzleCurrency)
        .set({
          totalPuzzlesTimedOutValue: sql`${puzzleCurrency.totalPuzzlesTimedOutValue} + ${creatorShare}`,
        })
        .where(eq(puzzleCurrency.mint, puzzleRecord.currencyMint));

      await tx.insert(playerActivityLog).values({
        player: creatorPubkey,
        puzzle: puzzlePubkey,
        event: 'PuzzleClaimedTimeOut',
        data: JSON.stringify({
          creatorShare,
          serviceShare,
        }),
      });

      await tx
        .update(playerActivity)
        .set({
          totalPuzzlesTimedOut: sql`${playerActivity.totalPuzzlesTimedOut} + 1`,
        })
        .where(eq(playerActivity.publicKey, creatorPubkey));

      if (playerCurrencyStatsRecord) {
        await tx
          .update(playerCurrencyStats)
          .set({
            totalPuzzlesTimedOutValue: sql`${playerCurrencyStats.totalPuzzlesTimedOutValue} + ${creatorShare}`,
          })
          .where(
            and(
              eq(playerCurrencyStats.player, creatorPubkey),
              eq(playerCurrencyStats.mint, puzzleRecord.currencyMint)
            )
          );
      } else {
        await tx.insert(playerCurrencyStats).values({
          player: creatorPubkey,
          mint: puzzleRecord.currencyMint,
          totalPuzzlesTimedOutValue: creatorShare,
        });
      }
    });
  }

  async handlePuzzleFinalTimerStartedEvent({
    event: { data },
  }: ExecEventFnOpts) {
    const { puzzle: puzzlePubkey, timestamp: timestampString } = data as {
      puzzle: string;
      timestamp: string;
    };
    const timestamp = parseInt(timestampString);

    await drizzleDb.transaction(async (tx) => {
      await tx
        .update(puzzle)
        .set({
          finalTimerStartAt: timestamp,
        })
        .where(eq(puzzle.publicKey, puzzlePubkey));
    });
  }
}
