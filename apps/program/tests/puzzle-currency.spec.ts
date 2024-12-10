import { Test } from './utils/test';

describe('puzzles', () => {
  let test: Test;

  beforeAll(async () => {
    test = await Test.new();

    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 10,
      puzzleAttemptFinalTimeoutSeconds: 20,
      maxAttempts: 200,
      create: true,
    });
  });

  it('can be created', async () => {
    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: test.gbMint,
      decimals: test.gbDecimals,
      serviceFee: 0.2,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 1,
        maxFee: 2,
      },
      create: true,
    });
  });

  it('can be updated', async () => {
    await test.setPuzzleCurrencyConfig({
      admin: test.admin,
      mint: test.gbMint,
      decimals: test.gbDecimals,
      serviceFee: 0.2,
      minimumInitialPrize: 1,
      feeConfig: {
        baseFee: 0.1,
        maxFee: 1,
      },
      create: false,
    });
  });
});
