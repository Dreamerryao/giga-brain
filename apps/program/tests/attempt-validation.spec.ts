import { utils as libLLM } from '@repo/lib/src/llm';
import { deserializeTx, serializeTx } from '@repo/lib/src/program/tx';

import { DEFAULT_PUZZLE_SYSTEM_PROMPT, Test } from './utils/test';

describe('attempt validation', () => {
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
  });

  it('validate metadata', async () => {
    const attempt = async (metadata: string) => {
      const { tx: initializedTx, blockhashWithExpiryBlockHeight } =
        await test.gbProgram.initRecordAttemptWithPayer({
          puzzlePDA: test.puzzle1PDA,
          maxFee: 70,
          prompt: 'Puzzle 1 Msg 5',
          solver: test.solver1,
          metadata,
        });
      const tx = deserializeTx(initializedTx);
      const mockVerifyPuzzleAttemptUserPrompt = jest
        .spyOn(libLLM, 'verifyAttemptPrompt')
        .mockResolvedValue(void 0);
      await test.gbProgram.finalizeRecordAttemptWithPayer({
        mint: test.gbMint,
        tx: serializeTx({ tx, requireAllSignatures: false }),
        prompt: 'Puzzle 1 Msg 5',
        metadata,
        promptsVerifier: test.promptsVerifier,
        blockhashWithExpiryBlockHeight,
      });
      expect(mockVerifyPuzzleAttemptUserPrompt).toHaveBeenCalledWith(prompt);
    };

    const expectFailure = async (metadata: string) => {
      try {
        await attempt(metadata);
        expect(false).toBeTruthy();
      } catch (err) {
        console.log('err', err);
        expect(err).toBeInstanceOf(Error);
        const anchorError = err as Error;
        expect(anchorError.message).toContain('Metadata is not valid');
      }
    };

    await expectFailure('');
    await expectFailure('{ test: "test" }');
    await expectFailure('{ invalidJSON: true }');
  });
});
