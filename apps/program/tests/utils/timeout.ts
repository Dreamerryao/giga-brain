import { expect } from '@jest/globals';
import * as anchor from '@coral-xyz/anchor';
import { sleep } from '@repo/lib/src/promise';

import { Test } from './test';

export interface PuzzleEvaluationData {
  solver: anchor.web3.Keypair;
  puzzlePDA: anchor.web3.PublicKey;
  prompt: string;
  expectedFee: number;
  expectedGameTotalAttemptsMade: number;
  expectedGameTotalFeesPaid: number;
  expectedPuzzleTotalAttemptsMade: number;
  expectedPuzzleTotalFeesPaid: number;
  expectedWalletTotalAttemptsMade: number;
  expectedWalletTotalFeesPaid: number;
  expectedPuzzleNextFee: number;
}

export function getTestTimeoutFns({
  test,
  attempt2,
  attempt3,
  attempt4,
  attempt5,
  attemptTimeoutSeconds,
  attemptFinalTimeoutSeconds,
  expectClaimFailure,
  claimTimeout,
}: {
  test: Test;
  attempt2: PuzzleEvaluationData;
  attempt3: PuzzleEvaluationData;
  attempt4: PuzzleEvaluationData;
  attempt5: PuzzleEvaluationData;
  attemptTimeoutSeconds: number;
  attemptFinalTimeoutSeconds: number;
  claimTimeout: () => Promise<void>;
  expectClaimFailure: (message: string) => Promise<void>;
}) {
  let finalTimerStartAt: number;

  async function puzzleEntersFinalTimerAfterMaxAttemptsReached() {
    await test.recordAttempt({
      ...attempt2,
    });
    await expectClaimFailure('PuzzleNotTimedOut');
    await test.evaluateRecordAttempt({
      ...attempt2,
      evaluationResult: {
        response: 'Puzzle 1 Response 2',
        pastUserPrompts: [
          {
            prompt: 'Puzzle 1 Msg 1',
            response: 'Puzzle 1 Response 1',
          },
        ],
      },
    });
    await expectClaimFailure('PuzzleStillInFinalTimer');
    const puzzle = await test.gbProgram.getPuzzle(test.puzzle1PDA);
    expect(puzzle.status.active).toBeDefined();
    expect(puzzle.finalTimerStartAt.toNumber()).toBeGreaterThan(0);
    finalTimerStartAt = puzzle.finalTimerStartAt.toNumber();
  }

  async function puzzleFeeRemainsTheSameInFinalTimer() {
    await test.recordAttempt({
      ...attempt3,
      evaluationResult: {
        response: 'Puzzle 1 Response 3',
        pastUserPrompts: [
          {
            prompt: 'Puzzle 1 Msg 1',
            response: 'Puzzle 1 Response 1',
          },
          {
            prompt: 'Puzzle 1 Msg 2',
            response: 'Puzzle 1 Response 2',
          },
        ],
      },
    });
    let puzzle = await test.gbProgram.getPuzzle(test.puzzle1PDA);
    expect(puzzle.status.active).toBeDefined();
    expect(puzzle.finalTimerStartAt.toNumber()).toEqual(finalTimerStartAt);

    await expectClaimFailure('PuzzleStillInFinalTimer');

    await test.recordAttempt({
      ...attempt4,
      evaluationResult: {
        response: 'Puzzle 1 Response 4',
        pastUserPrompts: [
          {
            prompt: 'Puzzle 1 Msg 1',
            response: 'Puzzle 1 Response 1',
          },
          {
            prompt: 'Puzzle 1 Msg 2',
            response: 'Puzzle 1 Response 2',
          },
          {
            prompt: 'Puzzle 1 Msg 3',
            response: 'Puzzle 1 Response 3',
          },
        ],
      },
    });
    puzzle = await test.gbProgram.getPuzzle(test.puzzle1PDA);
    expect(puzzle.status.active).toBeDefined();
    expect(puzzle.finalTimerStartAt.toNumber()).toEqual(finalTimerStartAt);

    await expectClaimFailure('PuzzleStillInFinalTimer');

    await test.recordAttempt({
      ...attempt5,
      evaluationResult: {
        response: 'Puzzle 1 Response 5',
        pastUserPrompts: [
          {
            prompt: 'Puzzle 1 Msg 1',
            response: 'Puzzle 1 Response 1',
          },
          {
            prompt: 'Puzzle 1 Msg 2',
            response: 'Puzzle 1 Response 2',
          },
          {
            prompt: 'Puzzle 1 Msg 3',
            response: 'Puzzle 1 Response 3',
          },
          {
            prompt: 'Puzzle 1 Msg 4',
            response: 'Puzzle 1 Response 4',
          },
        ],
      },
    });
    puzzle = await test.gbProgram.getPuzzle(test.puzzle1PDA);
    expect(puzzle.status.active).toBeDefined();
    expect(puzzle.finalTimerStartAt.toNumber()).toEqual(finalTimerStartAt);

    await expectClaimFailure('PuzzleStillInFinalTimer');
  }

  async function canClaimTimeoutAfterTimeout() {
    let puzzle = await test.gbProgram.getPuzzle(test.puzzle1PDA);
    console.log('puzzle', puzzle);
    expect(puzzle.status.active).toBeDefined();
    expect(puzzle.finalTimerStartAt.toNumber()).toEqual(finalTimerStartAt);
    expect(
      Date.now() / 1_000 - puzzle.finalTimerStartAt.toNumber()
    ).toBeLessThan(attemptFinalTimeoutSeconds);

    await sleep(attemptTimeoutSeconds * 1_000 + 1_000);

    puzzle = await test.gbProgram.getPuzzle(test.puzzle1PDA);
    expect(puzzle.status.active).toBeDefined();
    expect(puzzle.finalTimerStartAt.toNumber()).toEqual(finalTimerStartAt);
    expect(
      Date.now() / 1_000 - puzzle.finalTimerStartAt.toNumber()
    ).toBeGreaterThan(attemptFinalTimeoutSeconds);

    await claimTimeout();

    puzzle = await test.gbProgram.getPuzzle(test.puzzle1PDA);
    expect(puzzle.status.timedOut).toBeDefined();
  }

  async function preventsNewAttemptsAfterTimeoutClaim() {
    try {
      await test.recordAttempt({
        solver: test.solver1,
        puzzlePDA: test.puzzle1PDA,
        prompt: 'Puzzle 1 Msg 6',
        expectedFee: 1,
        expectedGameTotalAttemptsMade: 6,
        expectedGameTotalFeesPaid: 4.416227,
        expectedPuzzleTotalAttemptsMade: 6,
        expectedPuzzleTotalFeesPaid: 4.416227,
        expectedWalletTotalAttemptsMade: 6,
        expectedWalletTotalFeesPaid: 4.416227,
        expectedPuzzleNextFee: 1,
        evaluationResult: {
          response: 'Puzzle 1 Response 5',
          pastUserPrompts: [
            {
              prompt: 'Puzzle 1 Msg 1',
              response: 'Puzzle 1 Response 1',
            },
            {
              prompt: 'Puzzle 1 Msg 2',
              response: 'Puzzle 1 Response 2',
            },
            {
              prompt: 'Puzzle 1 Msg 3',
              response: 'Puzzle 1 Response 3',
            },
            {
              prompt: 'Puzzle 1 Msg 4',
              response: 'Puzzle 1 Response 4',
            },
            {
              prompt: 'Puzzle 1 Msg 5',
              response: 'Puzzle 1 Response 5',
            },
          ],
        },
      });
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('PuzzleNotActive');
    }
  }

  return {
    puzzleEntersFinalTimerAfterMaxAttemptsReached,
    puzzleFeeRemainsTheSameInFinalTimer,
    canClaimTimeoutAfterTimeout,
    preventsNewAttemptsAfterTimeoutClaim,
  };
}
