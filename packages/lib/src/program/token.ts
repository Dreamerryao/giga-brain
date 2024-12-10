import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { Account } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import {
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TokenInvalidMintError,
  TokenInvalidOwnerError,
} from '@solana/spl-token';

import { COMMITMENT } from './provider';

/**
 * Retrieve the associated token account, or create it if it doesn't exist
 *
 * @param connection               Connection to use
 * @param payer                    Payer of the transaction and initialization fees
 * @param mint                     Mint associated with the account to set or verify
 * @param owner                    Owner of the account to set or verify
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 * @param commitment               Desired level of commitment for querying the state
 * @param confirmOptions           Options for confirming the transaction
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Address of the new associated token account
 */
export async function getOrCreateAssociatedTokenAccount(
  connection: anchor.web3.Connection,
  payer: anchor.web3.Signer,
  mint: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey,
  sendAndConfirmTransaction: (tx: anchor.web3.Transaction) => Promise<string>
): Promise<Account> {
  const associatedToken = getAssociatedTokenAddressSync(mint, owner);

  // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
  // Sadly we can't do this atomically.
  let account: Account;
  try {
    account = await getAccount(connection, associatedToken, COMMITMENT);
  } catch (error: unknown) {
    console.log('error', error);
    // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
    // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
    // TokenInvalidAccountOwnerError in this code path.
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      // As this isn't atomic, it's possible others can create associated accounts meanwhile.
      try {
        const transaction = new anchor.web3.Transaction().add(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            associatedToken,
            owner,
            mint
          )
        );

        await sendAndConfirmTransaction(transaction);
      } catch (error: unknown) {
        // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
        // instruction error if the associated account exists already.
      }

      // Now this should always succeed
      account = await getAccount(connection, associatedToken, COMMITMENT);
    } else {
      throw error;
    }
  }

  if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
  if (!account.owner.equals(owner)) throw new TokenInvalidOwnerError();

  return account;
}
