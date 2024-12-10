import { expect } from '@jest/globals';
import { NATIVE_MINT } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

import { DEFAULT_PUZZLE_SYSTEM_PROMPT, Test } from './utils/test';
import { PuzzleEvaluationData, getTestTimeoutFns } from './utils/timeout';

describe('timed out attempts', () => {
  let test: Test;
  const attemptTimeoutSeconds = 15;
  const attemptFinalTimeoutSeconds = attemptTimeoutSeconds;
  let testTimeoutFns: ReturnType<typeof getTestTimeoutFns>;

  const claimTimeout = async () =>
    await test.creatorClaimTimeout({
      puzzlePDA: test.puzzle1PDA,
      expectedRefund: 3.733694916, // initial prize + (1 - service fee)
      expectedRefundApproximation: 3,
      expectedServiceShare: 0.6834237300000001, // service fee
      expectedServiceShareApproximation: 1,
      expectedGameTotalPuzzlesTimedOut: 1,
      expectedGameTotalPuzzlesTimedOutValue: 3.733694917,
      expectedPlayerTotalPuzzlesTimedOut: 1,
      expectedPlayerTotalPuzzlesTimedOutValue: 3.733694917,
    });

  const expectClaimFailure = async (errMsg: string) => {
    try {
      await claimTimeout();
      expect(false).toBeTruthy();
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain(errMsg);
    }
  };

  let attempt1: PuzzleEvaluationData;
  let attempt2: PuzzleEvaluationData;
  let attempt3: PuzzleEvaluationData;
  let attempt4: PuzzleEvaluationData;
  let attempt5: PuzzleEvaluationData;

  beforeAll(async () => {
    test = await Test.new();

    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: attemptTimeoutSeconds,
      puzzleAttemptFinalTimeoutSeconds: attemptFinalTimeoutSeconds,
      maxAttempts: 2,
      create: true,
    });

    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0.2,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: true,
    });

    await test.airdrop(test.creator1.publicKey, 2);
    await test.airdrop(test.solver1.publicKey, 10);

    await test.createPuzzle({
      creator: test.creator1,
      puzzlePDA: test.puzzle1PDA,
      prizeAmount: 1,
      puzzleNonce: 0,
      mint: NATIVE_MINT,
      prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
      expectedGameTotalPuzzlesCreated: 1,
      expectedWalletTotalPuzzlesCreated: 1,
      expectedPuzzleCurrentFee: 0.1,
      expectedGameTotalPrizesEscrowed: 1,
    });

    attempt1 = {
      solver: test.solver1,
      puzzlePDA: test.puzzle1PDA,
      prompt: 'Puzzle 1 Msg 1',
      expectedFee: 0.1,
      expectedGameTotalAttemptsMade: 1,
      expectedGameTotalFeesPaid: 0.1,
      expectedPuzzleTotalAttemptsMade: 1,
      expectedPuzzleTotalFeesPaid: 0.1,
      expectedWalletTotalAttemptsMade: 1,
      expectedWalletTotalFeesPaid: 0.1,
      expectedPuzzleNextFee: 0.316227766,
    };

    attempt2 = {
      solver: test.solver1,
      puzzlePDA: test.puzzle1PDA,
      prompt: 'Puzzle 1 Msg 2',
      expectedFee: 0.316227766,
      expectedGameTotalAttemptsMade: 2,
      expectedGameTotalFeesPaid: 0.416227766,
      expectedPuzzleTotalAttemptsMade: 2,
      expectedPuzzleTotalFeesPaid: 0.416227766,
      expectedWalletTotalAttemptsMade: 2,
      expectedWalletTotalFeesPaid: 0.416227766,
      expectedPuzzleNextFee: 1,
    };

    attempt3 = {
      solver: test.solver1,
      puzzlePDA: test.puzzle1PDA,
      prompt: 'Puzzle 1 Msg 3',
      expectedFee: 1,
      expectedGameTotalAttemptsMade: 3,
      expectedGameTotalFeesPaid: 1.416227766,
      expectedPuzzleTotalAttemptsMade: 3,
      expectedPuzzleTotalFeesPaid: 1.416227766,
      expectedWalletTotalAttemptsMade: 3,
      expectedWalletTotalFeesPaid: 1.416227766,
      expectedPuzzleNextFee: 1,
    };

    attempt4 = {
      solver: test.solver1,
      puzzlePDA: test.puzzle1PDA,
      prompt: 'Puzzle 1 Msg 4',
      expectedFee: 1,
      expectedGameTotalAttemptsMade: 4,
      expectedGameTotalFeesPaid: 2.416227766,
      expectedPuzzleTotalAttemptsMade: 4,
      expectedPuzzleTotalFeesPaid: 2.416227766,
      expectedWalletTotalAttemptsMade: 4,
      expectedWalletTotalFeesPaid: 2.416227766,
      expectedPuzzleNextFee: 1,
    };

    attempt5 = {
      solver: test.solver1,
      puzzlePDA: test.puzzle1PDA,
      prompt: 'Puzzle 1 Msg 5',
      expectedFee: 1,
      expectedGameTotalAttemptsMade: 5,
      expectedGameTotalFeesPaid: 3.416227766,
      expectedPuzzleTotalAttemptsMade: 5,
      expectedPuzzleTotalFeesPaid: 3.416227766,
      expectedWalletTotalAttemptsMade: 5,
      expectedWalletTotalFeesPaid: 3.416227766,
      expectedPuzzleNextFee: 1,
    };

    await expectClaimFailure('NoPuzzleAttempts');

    await test.recordAttempt({
      ...attempt1,
    });

    await expectClaimFailure('PuzzleNotTimedOut');

    await test.evaluateRecordAttempt({
      ...attempt1,
      evaluationResult: {
        response: 'Puzzle 1 Response 1',
        pastUserPrompts: [],
      },
    });
    const puzzle = await test.gbProgram.getPuzzle(test.puzzle1PDA);
    expect(puzzle.status.active).toBeDefined();
    expect(puzzle.finalTimerStartAt.toNumber()).toBe(0);

    testTimeoutFns = getTestTimeoutFns({
      test,
      attempt2,
      attempt3,
      attempt4,
      attempt5,
      expectClaimFailure,
      claimTimeout,
      attemptTimeoutSeconds,
      attemptFinalTimeoutSeconds,
    });
  });

  it('puzzle enters final timer after max attempts reached', async () => {
    await testTimeoutFns.puzzleEntersFinalTimerAfterMaxAttemptsReached();
  });

  it('puzzle fee remains the same in final timer', async () => {
    await testTimeoutFns.puzzleFeeRemainsTheSameInFinalTimer();
  });

  it('can claim timeout after timeout', async () => {
    await testTimeoutFns.canClaimTimeoutAfterTimeout();
  });

  it('prevents new attempts after timeout claim', async () => {
    await testTimeoutFns.preventsNewAttemptsAfterTimeoutClaim();
  });
});
