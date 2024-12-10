import { expect } from '@jest/globals';
import * as anchor from '@coral-xyz/anchor';
import { NATIVE_MINT } from '@solana/spl-token';

import { DEFAULT_PUZZLE_SYSTEM_PROMPT, Test } from './utils/test';

describe('puzzles created by sol', () => {
  let test: Test;

  beforeAll(async () => {
    test = await Test.new();

    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 10,
      puzzleAttemptFinalTimeoutSeconds: 20,
      maxAttempts: 50,
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
  });
  it('can be created', async () => {
    await test.airdrop(test.creator1.publicKey, 0.009);
    const createPuzzleIx = () =>
      test.createPuzzle({
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
    try {
      await createPuzzleIx();
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InsufficientFunds');
    }
    await test.airdrop(test.creator1.publicKey, 1);
    await createPuzzleIx();
  });
  it('fails to create second puzzle with different creator in puzzlePDA', async () => {
    await test.airdrop(test.creator2.publicKey, 7);
    try {
      await test.createPuzzle({
        creator: test.creator2,
        puzzlePDA: test.puzzle1PDA,
        prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
        prizeAmount: 1,
        puzzleNonce: 1,
        mint: NATIVE_MINT,
        expectedGameTotalPuzzlesCreated: 1,
        expectedWalletTotalPuzzlesCreated: 1,
        expectedPuzzleCurrentFee: 0.1,
        expectedGameTotalPrizesEscrowed: 1,
      });
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('ConstraintSeeds');
    }
  });
  it('can be created with a different creator', async () => {
    await test.airdrop(test.creator2.publicKey, 2);
    await test.createPuzzle({
      creator: test.creator2,
      puzzlePDA: test.puzzle2PDA,
      prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
      prizeAmount: 1,
      puzzleNonce: 1,
      mint: NATIVE_MINT,
      expectedGameTotalPuzzlesCreated: 2,
      expectedWalletTotalPuzzlesCreated: 1,
      expectedPuzzleCurrentFee: 0.1,
      expectedGameTotalPrizesEscrowed: 2,
    });
  });
  it('solver 1 records attempt 1 for puzzle 1', async () => {
    // await airdrop(solver1.publicKey, 0.009);
    const recordAttemptIx = () =>
      test.recordAttempt({
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
        expectedPuzzleNextFee: 0.104712854,
      });
    // try {
    //   await recordAttemptIx();
    //   expect(false).toBeTruthy(); // Should not reach here
    // } catch (err) {
    //   console.log('err', err);
    //   expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
    //   const anchorError = err as anchor.web3.SendTransactionError;
    //   expect(anchorError.message).toContain('InsufficientFunds');
    // }
    await test.airdrop(test.solver1.publicKey, 10);
    await recordAttemptIx();
  });
  it('cannot make new attempts before current attempt is rejected or approved', async () => {
    const solver = test.solver2;
    const puzzlePDA = test.puzzle1PDA;
    await test.airdrop(solver.publicKey, 10);
    try {
      await test.recordAttempt({
        solver,
        puzzlePDA,
        prompt: 'Puzzle 1 Msg 1',
        expectedFee: 0.104712854,
        expectedGameTotalAttemptsMade: 2,
        expectedGameTotalFeesPaid: 0.2296306,
        expectedPuzzleTotalAttemptsMade: 2,
        expectedPuzzleTotalFeesPaid: 0.2296306,
        expectedWalletTotalAttemptsMade: 1,
        expectedWalletTotalFeesPaid: 0.104712854,
        expectedPuzzleNextFee: 0.104712854,
      });
      expect(false).toBeTruthy();
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('PuzzleInAttemptedState');
    }
    await test.evaluateRecordAttempt({
      solver: test.solver1,
      puzzlePDA: test.puzzle1PDA,
      prompt: 'Puzzle 1 Msg 1',
      expectedFee: 0.1,
      evaluationResult: {
        response: 'Puzzle 1 Response 1',
        pastUserPrompts: [],
      },
      expectedGameTotalAttemptsMade: 1,
      expectedGameTotalFeesPaid: 0.1,
      expectedPuzzleTotalAttemptsMade: 1,
      expectedPuzzleTotalFeesPaid: 0.1,
      expectedWalletTotalAttemptsMade: 1,
      expectedWalletTotalFeesPaid: 0.1,
      expectedPuzzleNextFee: 0.104712854,
    });
  });
  // it('cannot reject transfer if puzzle is not attempted', async () => {
  //   try {
  //     await rejectTransfer({
  //       puzzlePDA: puzzle1PDA,
  //     });
  //     expect(false).toBeTruthy();
  //   } catch (err) {
  //     console.log('err', err);
  //     expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
  //     const anchorError = err as anchor.web3.SendTransactionError;
  //     expect(anchorError.message).toContain('PuzzleNotAttempted');
  //   }
  // });
  it('solver 2 records attempt 1 for puzzle 1', async () => {
    const solver = test.solver2;
    const puzzlePDA = test.puzzle1PDA;
    await test.recordAttempt({
      solver,
      puzzlePDA,
      prompt: 'Puzzle 1 Msg 2',
      evaluationResult: {
        response: 'Puzzle 1 Response 2',
        pastUserPrompts: [
          {
            prompt: 'Puzzle 1 Msg 1',
            response: 'Puzzle 1 Response 1',
          },
        ],
      },
      expectedFee: 0.104712854,
      expectedGameTotalAttemptsMade: 2,
      expectedGameTotalFeesPaid: 0.204712854,
      expectedPuzzleTotalAttemptsMade: 2,
      expectedPuzzleTotalFeesPaid: 0.204712854,
      expectedWalletTotalAttemptsMade: 1,
      expectedWalletTotalFeesPaid: 0.104712854,
      expectedPuzzleNextFee: 0.109647819,
    });
  });
  it('solver 1 records attempt 2 for puzzle 2', async () => {
    const solver = test.solver1;
    const puzzlePDA = test.puzzle2PDA;
    await test.recordAttempt({
      solver,
      puzzlePDA,
      prompt: 'Puzzle 2 Msg 1',
      evaluationResult: {
        response: 'Puzzle 2 Response 1',
        pastUserPrompts: [],
      },
      expectedFee: 0.1,
      expectedGameTotalAttemptsMade: 3,
      expectedGameTotalFeesPaid: 0.304712854,
      expectedPuzzleTotalAttemptsMade: 1,
      expectedPuzzleTotalFeesPaid: 0.1,
      expectedWalletTotalAttemptsMade: 2,
      expectedWalletTotalFeesPaid: 0.2,
      expectedPuzzleNextFee: 0.104712854,
    });
  });
  it('solver 1 records attempt 3 for puzzle 1', async () => {
    const solver = test.solver1;
    const puzzlePDA = test.puzzle1PDA;
    await test.recordAttempt({
      solver,
      puzzlePDA,
      prompt: 'Puzzle 1 Msg 3',
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
        approvedTransfer: {
          expectedSolverShare: 1.052201242,
          expectedServiceShare: 0.26305031099999976,
          expectedShareApproximation: 2,
          expectedGameTotalPuzzlesSolved: 1,
          expectedWalletTotalPuzzlesSolved: 1,
        },
      },
      expectedFee: 0.109647819,
      expectedGameTotalAttemptsMade: 4,
      expectedGameTotalFeesPaid: 0.414360673,
      expectedPuzzleTotalAttemptsMade: 3,
      expectedPuzzleTotalFeesPaid: 0.314360673,
      expectedWalletTotalAttemptsMade: 3,
      expectedWalletTotalFeesPaid: 0.309647819,
      expectedPuzzleNextFee: 0.114815362,
    });
  });
  it('cannot submit new attempts after puzzle is completed', async () => {
    try {
      await test.recordAttempt({
        solver: test.solver1,
        puzzlePDA: test.puzzle1PDA,
        prompt: 'Msg 5',
        expectedFee: 0.114815362,
        expectedGameTotalAttemptsMade: 5,
        expectedGameTotalFeesPaid: 0.514815362,
        expectedPuzzleTotalAttemptsMade: 4,
        expectedPuzzleTotalFeesPaid: 0.414815362,
        expectedWalletTotalAttemptsMade: 4,
        expectedWalletTotalFeesPaid: 0.414815362,
        expectedPuzzleNextFee: 0.1,
      });
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('PuzzleNotActive');
    }
  });
  it('solver cannot claim prize that they did not win', async () => {
    try {
      await test.claimPrize({
        puzzlePDA: test.puzzle1PDA,
        solver: test.solver2,
        expectedSolverShare: 0,
        expectedShareApproximation: 0,
      });
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InvalidPuzzleSolver');
    }
  });
  it('solver can claim prize of successful puzzle', async () => {
    await test.claimPrize({
      puzzlePDA: test.puzzle1PDA,
      solver: test.solver1,
      expectedSolverShare: 1.052201242,
      expectedShareApproximation: 2,
    });
  });
});
