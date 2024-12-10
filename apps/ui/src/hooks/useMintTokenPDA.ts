import { useMemo } from 'react';
import * as anchor from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import { usePDA } from './usePDA';

function useMintTokenPDA(
  mint: anchor.web3.PublicKey | null,
  walletPubkey: anchor.web3.PublicKey | null
) {
  const seeds = useMemo(
    () =>
      !(mint && walletPubkey)
        ? null
        : [
            walletPubkey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mint!.toBuffer(),
          ],
    [walletPubkey, mint]
  );
  const { account } = usePDA(ASSOCIATED_TOKEN_PROGRAM_ID, seeds);
  return account;
}

export default useMintTokenPDA;
