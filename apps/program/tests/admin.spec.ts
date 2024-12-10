import { expect } from '@jest/globals';
import * as anchor from '@coral-xyz/anchor';

import { Test } from './utils/test';

describe('admin', () => {
  let test: Test;

  beforeAll(async () => {
    test = await Test.new();
  });

  it('can be created', async () => {
    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 10,
      puzzleAttemptFinalTimeoutSeconds: 20,
      maxAttempts: 50,
      create: true,
    });
  });

  it('can be updated', async () => {
    await test.setGameConfig({
      admin: test.admin,
      promptsVerifier: test.promptsVerifier.publicKey,
      puzzlesVerifier: test.puzzlesVerifier.publicKey,
      puzzleAttemptTimeoutSeconds: 60,
      puzzleAttemptFinalTimeoutSeconds: 120,
      maxAttempts: 100,
    });
  });

  it('can be transferred to a new admin', async () => {
    const newAdmin = anchor.web3.Keypair.generate();
    await test.airdrop(newAdmin.publicKey, 1);

    await test.transferAdmin({
      admin: test.admin,
      newAdmin: newAdmin.publicKey,
    });

    // Verify old admin can't update config anymore
    try {
      await test.transferAdmin({
        admin: test.admin,
        newAdmin: anchor.web3.Keypair.generate().publicKey,
      });
      expect(false).toBeTruthy(); // Should not reach here
    } catch (err) {
      console.log('err', err);
      expect(err).toBeInstanceOf(anchor.web3.SendTransactionError);
      const anchorError = err as anchor.web3.SendTransactionError;
      expect(anchorError.message).toContain('InvalidAdmin');
    }

    // revert to old admin
    await test.transferAdmin({
      admin: newAdmin,
      newAdmin: test.admin.publicKey,
    });
  });
});
