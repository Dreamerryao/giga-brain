import * as anchor from '@coral-xyz/anchor';

export type Wallet = {
  publicKey: anchor.web3.PublicKey | null;
  signMessage:
    | ((message: Uint8Array) => Promise<Uint8Array | null>)
    | undefined;
  signTransaction:
    | (<T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(
        transaction: T
      ) => Promise<T | null>)
    | undefined;
  disconnect: () => Promise<void>;
  connect: () => Promise<void>;
};

export type LocalWallet = Wallet & {
  setWallet: (privKey: string | null) => void;
};
