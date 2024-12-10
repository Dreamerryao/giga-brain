import { expect } from '@jest/globals';
import * as anchor from '@coral-xyz/anchor';
import { NATIVE_MINT } from '@solana/spl-token';
import { sleep } from '@repo/lib/src/promise';

import { DEFAULT_PUZZLE_SYSTEM_PROMPT, Test } from './utils/test';

describe('new puzzle', () => {
  let test: Test;

  beforeAll(async () => {
    test = await Test.new();

    await test.airdrop(test.creator1.publicKey, 2);
    await test.airdrop(test.solver1.publicKey, 1);

    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 0,
      puzzleAttemptFinalTimeoutSeconds: 0,
      maxAttempts: 0,
      create: true,
    });

    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0,
        maxFee: 0,
      },
      create: true,
    });
  });
  it('validates max attempts', async () => {
    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 0,
      puzzleAttemptFinalTimeoutSeconds: 0,
      maxAttempts: 50,
      create: false,
    });

    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });

    try {
      await test.createPuzzle({
        creator: test.creator1,
        puzzlePDA: test.puzzle1PDA,
        mint: NATIVE_MINT,
        prizeAmount: 1,
        prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
        puzzleNonce: 0,
        maxAttempts: 1,
        expectedGameTotalPuzzlesCreated: 1,
        expectedWalletTotalPuzzlesCreated: 1,
        expectedPuzzleCurrentFee: 0.1,
        expectedGameTotalPrizesEscrowed: 1,
      });
      expect(false).toBeTruthy();
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InvalidMaxAttempts');
    }
  });
  it('validates base fee', async () => {
    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });

    try {
      await test.createPuzzle({
        creator: test.creator1,
        puzzlePDA: test.puzzle1PDA,
        mint: NATIVE_MINT,
        prizeAmount: 1,
        prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
        puzzleNonce: 0,
        baseFee: 0.01,
        expectedGameTotalPuzzlesCreated: 1,
        expectedWalletTotalPuzzlesCreated: 1,
        expectedPuzzleCurrentFee: 0.1,
        expectedGameTotalPrizesEscrowed: 1,
      });
      expect(false).toBeTruthy();
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InvalidBaseFee');
    }
  });
  it('validates max fee', async () => {
    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });

    try {
      await test.createPuzzle({
        creator: test.creator1,
        puzzlePDA: test.puzzle1PDA,
        mint: NATIVE_MINT,
        prizeAmount: 1,
        prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
        puzzleNonce: 0,
        maxFee: 1.9,
        expectedGameTotalPuzzlesCreated: 1,
        expectedWalletTotalPuzzlesCreated: 1,
        expectedPuzzleCurrentFee: 0.1,
        expectedGameTotalPrizesEscrowed: 1,
      });
      expect(false).toBeTruthy();
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InvalidMaxFee');
    }
  });
  it('validates base fee is less than max fee', async () => {
    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 0,
      puzzleAttemptFinalTimeoutSeconds: 0,
      maxAttempts: 50,
      create: false,
    });

    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });

    try {
      await test.createPuzzle({
        creator: test.creator1,
        puzzlePDA: test.puzzle1PDA,
        mint: NATIVE_MINT,
        prizeAmount: 1,
        prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
        puzzleNonce: 0,
        baseFee: 2,
        expectedGameTotalPuzzlesCreated: 1,
        expectedWalletTotalPuzzlesCreated: 1,
        expectedPuzzleCurrentFee: 0.1,
        expectedGameTotalPrizesEscrowed: 1,
      });
      expect(false).toBeTruthy();
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InvalidBaseFeeAndMaxFee');
    }
  });
  it('validates attempt timeout seconds', async () => {
    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 2,
      puzzleAttemptFinalTimeoutSeconds: 10,
      maxAttempts: 50,
      create: false,
    });

    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });

    try {
      await test.createPuzzle({
        creator: test.creator1,
        puzzlePDA: test.puzzle1PDA,
        mint: NATIVE_MINT,
        prizeAmount: 1,
        prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
        puzzleNonce: 0,
        attemptTimeoutSeconds: 1,
        expectedGameTotalPuzzlesCreated: 1,
        expectedWalletTotalPuzzlesCreated: 1,
        expectedPuzzleCurrentFee: 0.1,
        expectedGameTotalPrizesEscrowed: 1,
      });
      expect(false).toBeTruthy();
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InvalidAttemptTimeoutSeconds');
    }
  });
  it('validates attempt final timeout seconds', async () => {
    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 2,
      puzzleAttemptFinalTimeoutSeconds: 10,
      maxAttempts: 50,
      create: false,
    });

    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });

    try {
      await test.createPuzzle({
        creator: test.creator1,
        puzzlePDA: test.puzzle1PDA,
        mint: NATIVE_MINT,
        prizeAmount: 1,
        prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
        puzzleNonce: 0,
        attemptFinalTimeoutSeconds: 9,
        expectedGameTotalPuzzlesCreated: 1,
        expectedWalletTotalPuzzlesCreated: 1,
        expectedPuzzleCurrentFee: 0.1,
        expectedGameTotalPrizesEscrowed: 1,
      });
      expect(false).toBeTruthy();
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain(
        'InvalidAttemptFinalTimeoutSeconds'
      );
    }
  });
  it('cannot be claimed for timeout prize if not attempted', async () => {
    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 0,
      puzzleAttemptFinalTimeoutSeconds: 0,
      maxAttempts: 50,
      create: false,
    });

    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });

    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: NATIVE_MINT,
      decimals: 9,
      serviceFee: 0,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });

    await test.createPuzzle({
      creator: test.creator1,
      puzzlePDA: test.puzzle1PDA,
      mint: NATIVE_MINT,
      prizeAmount: 1,
      prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
      puzzleNonce: 0,
      expectedGameTotalPuzzlesCreated: 1,
      expectedWalletTotalPuzzlesCreated: 1,
      expectedPuzzleCurrentFee: 0.1,
      expectedGameTotalPrizesEscrowed: 1,
    });

    await sleep(2_000);

    try {
      await test.creatorClaimTimeout({
        puzzlePDA: test.puzzle1PDA,
        expectedRefund: 1.0007, // initial prize + (1 - service fee)
        expectedRefundApproximation: 3,
        expectedServiceShare: 0.0003, // service fee
        expectedServiceShareApproximation: 1,
        expectedGameTotalPuzzlesTimedOut: 1,
        expectedGameTotalPuzzlesTimedOutValue: 1,
        expectedPlayerTotalPuzzlesTimedOut: 1,
        expectedPlayerTotalPuzzlesTimedOutValue: 1,
      });
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('NoPuzzleAttempts');
    }
  });
});
