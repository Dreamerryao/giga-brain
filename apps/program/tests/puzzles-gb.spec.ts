import { expect } from '@jest/globals';
import * as anchor from '@coral-xyz/anchor';

import { DEFAULT_PUZZLE_SYSTEM_PROMPT, Test } from './utils/test';

describe('puzzles created by gb (service fee waived)', () => {
  let test: Test;

  const createPuzzleIx = (prizeAmount: number = 12_000) =>
    test.createPuzzle({
      creator: test.creator1,
      puzzlePDA: test.puzzle1PDA,
      prizeAmount,
      puzzleNonce: 0,
      mint: test.gbMint,
      prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
      expectedGameTotalPuzzlesCreated: 1,
      expectedWalletTotalPuzzlesCreated: 1,
      expectedPuzzleCurrentFee: 70,
      expectedGameTotalPrizesEscrowed: 12_000,
    });

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
      mint: test.gbMint,
      decimals: test.gbDecimals,
      serviceFee: 0,
      minimumInitialPrize: 10_000,
      feeConfig: {
        baseFee: 70,
        maxFee: 1000,
      },
      create: true,
    });

    await test.airdrop(test.creator1.publicKey, 1);
    await test.airdrop(test.creator2.publicKey, 1);
    await test.airdrop(test.solver1.publicKey, 1);
    await test.airdrop(test.solver2.publicKey, 1);
  });
  it('requires minimum initial prize', async () => {
    await test.faucetToken(test.gbMint, test.creator1GbTokenAccount, 1);
    try {
      await createPuzzleIx(50);
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InsufficientPrize');
    }
  });
  it('requires creator to have enough funds', async () => {
    try {
      await createPuzzleIx();
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InsufficientFunds');
    }
  });
  it('can be created', async () => {
    await test.faucetToken(test.gbMint, test.creator1GbTokenAccount, 50_000);
    await createPuzzleIx();
  });
  it('fails to create second puzzle with different creator in puzzlePDA', async () => {
    await test.faucetToken(test.gbMint, test.creator2GbTokenAccount, 50_000);
    try {
      await test.createPuzzle({
        creator: test.creator2,
        puzzlePDA: test.puzzle1PDA,
        prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
        prizeAmount: 1,
        puzzleNonce: 1,
        mint: test.gbMint,
        expectedGameTotalPuzzlesCreated: 1,
        expectedWalletTotalPuzzlesCreated: 1,
        expectedPuzzleCurrentFee: 70,
        expectedGameTotalPrizesEscrowed: 12_000,
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
    await test.createPuzzle({
      creator: test.creator2,
      puzzlePDA: test.puzzle2PDA,
      prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
      prizeAmount: 15_000,
      puzzleNonce: 1,
      mint: test.gbMint,
      expectedGameTotalPuzzlesCreated: 2,
      expectedWalletTotalPuzzlesCreated: 1,
      expectedPuzzleCurrentFee: 70,
      expectedGameTotalPrizesEscrowed: 27_000,
    });
  });
  it('solver 1 records attempt 1 for puzzle 1', async () => {
    await test.faucetToken(test.gbMint, test.solver1GbTokenAccount, 1);
    const recordAttemptIx = () =>
      test.recordAttempt({
        solver: test.solver1,
        puzzlePDA: test.puzzle1PDA,
        prompt: 'Puzzle 1 Msg 1',
        expectedFee: 70,
        expectedGameTotalAttemptsMade: 1,
        expectedGameTotalFeesPaid: 70,
        expectedPuzzleTotalAttemptsMade: 1,
        expectedPuzzleTotalFeesPaid: 70,
        expectedWalletTotalAttemptsMade: 1,
        expectedWalletTotalFeesPaid: 70,
        expectedPuzzleNextFee: 73.823746,
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
    await test.faucetToken(test.gbMint, test.solver1GbTokenAccount, 6_000);
    await recordAttemptIx();
  });
  it('cannot make new attempts before current attempt is rejected or approved', async () => {
    const solver = test.solver2;
    const puzzlePDA = test.puzzle1PDA;
    await test.faucetToken(test.gbMint, test.solver2GbTokenAccount, 50_000);
    try {
      await test.recordAttempt({
        solver,
        puzzlePDA,
        prompt: 'Puzzle 1 Msg 1',
        expectedFee: 73.823746,
        expectedGameTotalAttemptsMade: 2,
        expectedGameTotalFeesPaid: 140296306,
        expectedPuzzleTotalAttemptsMade: 2,
        expectedPuzzleTotalFeesPaid: 140296306,
        expectedWalletTotalAttemptsMade: 1,
        expectedWalletTotalFeesPaid: 73.823746,
        expectedPuzzleNextFee: 73.823746,
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
      evaluationResult: {
        response: 'Puzzle 1 Response 1',
        pastUserPrompts: [],
      },
      expectedFee: 70,
      expectedGameTotalAttemptsMade: 1,
      expectedGameTotalFeesPaid: 70,
      expectedPuzzleTotalAttemptsMade: 1,
      expectedPuzzleTotalFeesPaid: 70,
      expectedWalletTotalAttemptsMade: 1,
      expectedWalletTotalFeesPaid: 70,
      expectedPuzzleNextFee: 73.823746,
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
      expectedFee: 73.823746,
      expectedGameTotalAttemptsMade: 2,
      expectedGameTotalFeesPaid: 143.823746,
      expectedPuzzleTotalAttemptsMade: 2,
      expectedPuzzleTotalFeesPaid: 143.823746,
      expectedWalletTotalAttemptsMade: 1,
      expectedWalletTotalFeesPaid: 73.823746,
      expectedPuzzleNextFee: 77.856364,
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
      expectedFee: 70,
      expectedGameTotalAttemptsMade: 3,
      expectedGameTotalFeesPaid: 213.823746,
      expectedPuzzleTotalAttemptsMade: 1,
      expectedPuzzleTotalFeesPaid: 70,
      expectedWalletTotalAttemptsMade: 2,
      expectedWalletTotalFeesPaid: 140,
      expectedPuzzleNextFee: 73.823746,
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
          expectedSolverShare: 12221.680109999998,
          expectedServiceShare: 0,
          expectedShareApproximation: 2,
          expectedGameTotalPuzzlesSolved: 1,
          expectedWalletTotalPuzzlesSolved: 1,
        },
      },
      expectedFee: 77.856364,
      expectedGameTotalAttemptsMade: 4,
      expectedGameTotalFeesPaid: 291.68011,
      expectedPuzzleTotalAttemptsMade: 3,
      expectedPuzzleTotalFeesPaid: 221.68011,
      expectedWalletTotalAttemptsMade: 3,
      expectedWalletTotalFeesPaid: 217.856364,
      expectedPuzzleNextFee: 82.109263,
    });
  });
  it('cannot submit new attempts after puzzle is completed', async () => {
    try {
      await test.recordAttempt({
        solver: test.solver1,
        puzzlePDA: test.puzzle1PDA,
        prompt: 'Msg 5',
        expectedFee: 82.109263,
        expectedGameTotalAttemptsMade: 5,
        expectedGameTotalFeesPaid: 0.514815362,
        expectedPuzzleTotalAttemptsMade: 4,
        expectedPuzzleTotalFeesPaid: 0.414815362,
        expectedWalletTotalAttemptsMade: 4,
        expectedWalletTotalFeesPaid: 0.414815362,
        expectedPuzzleNextFee: 70,
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
      expectedSolverShare: 12221.680109999998,
      expectedShareApproximation: 2,
    });
  });
});
