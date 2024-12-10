import { DEFAULT_PUZZLE_SYSTEM_PROMPT, Test } from './utils/test';

describe('my chat mode', () => {
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
    await test.airdrop(test.solver1.publicKey, 1);
    await test.airdrop(test.solver2.publicKey, 1);
  });
  it('setup', async () => {
    await test.faucetToken(test.gbMint, test.creator1GbTokenAccount, 50_000);

    await test.createPuzzle({
      creator: test.creator1,
      puzzlePDA: test.puzzle1PDA,
      prizeAmount: 12_000,
      puzzleNonce: 0,
      mint: test.gbMint,
      prompt: DEFAULT_PUZZLE_SYSTEM_PROMPT,
      expectedGameTotalPuzzlesCreated: 1,
      expectedWalletTotalPuzzlesCreated: 1,
      expectedPuzzleCurrentFee: 70,
      expectedGameTotalPrizesEscrowed: 12_000,
    });

    await test.faucetToken(test.gbMint, test.solver1GbTokenAccount, 150_000);
    await test.faucetToken(test.gbMint, test.solver2GbTokenAccount, 150_000);

    await test.recordAttempt({
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
      evaluationResult: {
        response: 'Puzzle 1 Response 1',
        pastUserPrompts: [],
      },
    });

    await test.recordAttempt({
      solver: test.solver2,
      puzzlePDA: test.puzzle1PDA,
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
  it('works without myChat', async () => {
    await test.recordAttempt({
      solver: test.solver1,
      puzzlePDA: test.puzzle1PDA,
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
      },
      expectedFee: 77.856364,
      expectedGameTotalAttemptsMade: 3,
      expectedGameTotalFeesPaid: 221.68011,
      expectedPuzzleTotalAttemptsMade: 3,
      expectedPuzzleTotalFeesPaid: 221.68011,
      expectedWalletTotalAttemptsMade: 2,
      expectedWalletTotalFeesPaid: 147.856364,
      expectedPuzzleNextFee: 82.109263,
    });
  });
  it('works with myChat', async () => {
    // exludes message 2
    await test.recordAttempt({
      solver: test.solver1,
      puzzlePDA: test.puzzle1PDA,
      prompt: 'Puzzle 1 Msg 4',
      myChat: true,
      evaluationResult: {
        response: 'Puzzle 1 Response 3',
        pastUserPrompts: [
          {
            prompt: 'Puzzle 1 Msg 1',
            response: 'Puzzle 1 Response 1',
          },
          // {
          //   prompt: 'Puzzle 1 Msg 2',
          //   response: 'Puzzle 1 Response 2',
          // },
          {
            prompt: 'Puzzle 1 Msg 3',
            response: 'Puzzle 1 Response 3',
          },
        ],
      },
      expectedFee: 82.109263,
      expectedGameTotalAttemptsMade: 4,
      expectedGameTotalFeesPaid: 303.789373,
      expectedPuzzleTotalAttemptsMade: 4,
      expectedPuzzleTotalFeesPaid: 303.789373,
      expectedWalletTotalAttemptsMade: 3,
      expectedWalletTotalFeesPaid: 229.965627,
      expectedPuzzleNextFee: 86.594477,
    });
  });
});
