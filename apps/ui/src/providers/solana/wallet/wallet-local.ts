'use client';

import { useCallback } from 'react';
import * as anchor from '@coral-xyz/anchor';
import {
  isVersionedTransaction,
  WalletSignMessageError,
} from '@solana/wallet-adapter-base';
import nacl from 'tweetnacl';
import { useState, useEffect } from 'react';
import bs58 from 'bs58';

import * as localPrivKey from '@/lib/local-priv-key';
import { useUI } from '@/providers/ui';

import { LocalWallet } from './types';

export function useLocalWallet(): LocalWallet {
  const {
    isLocalWallet: { isLocal },
  } = useUI();

  const [wallet, updateWallet] = useState<NodeWallet | null>(null);

  const setWallet = useCallback(
    (privateKey: string | null) => {
      if (!privateKey) {
        updateWallet(null);
      } else {
        const secretKeyBytes = bs58.decode(privateKey);
        const keypair = anchor.web3.Keypair.fromSecretKey(
          Buffer.from(secretKeyBytes),
          {
            skipValidation: true,
          }
        );
        updateWallet(new NodeWallet(keypair));
      }
      localPrivKey.set(privateKey);
    },
    [updateWallet]
  );

  const signMessage = useCallback(
    async (msg: Uint8Array) => {
      if (!wallet) {
        return null;
      }
      const secretKey = wallet.payer.secretKey;
      if (!secretKey) {
        return null;
      }
      try {
        return nacl.sign.detached(msg, secretKey);
      } catch (error) {
        throw new WalletSignMessageError((error as Error)?.message, error);
      }
    },
    [wallet]
  );

  const signTransaction = useCallback(
    async <
      T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction,
    >(
      tx: T
    ): Promise<T | null> => {
      return (await wallet?.signTransaction(tx)) ?? null;
    },
    [wallet]
  );

  const disconnect = useCallback(async () => {
    setWallet(null);
  }, [setWallet]);

  const connect = useCallback(async () => {
    const privateKey = localPrivKey.get();
    if (privateKey) {
      setWallet(privateKey);
    }
  }, [setWallet]);

  useEffect(() => {
    if (isLocal) {
      const privateKey = localPrivKey.get();
      if (privateKey) {
        setWallet(privateKey);
      }
    }
  }, [setWallet, isLocal]);

  return {
    publicKey: wallet?.publicKey ?? null,
    signMessage,
    signTransaction,
    disconnect,
    connect,
    setWallet,
  };
}

class NodeWallet implements anchor.Wallet {
  constructor(readonly payer: anchor.web3.Keypair) {}

  async signTransaction<
    T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction,
  >(tx: T): Promise<T> {
    if (isVersionedTransaction(tx)) {
      tx.sign([this.payer]);
    } else {
      tx.partialSign(this.payer);
    }

    return tx;
  }

  async signAllTransactions<
    T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction,
  >(txs: T[]): Promise<T[]> {
    return txs.map((t) => {
      if (isVersionedTransaction(t)) {
        t.sign([this.payer]);
      } else {
        t.partialSign(this.payer);
      }
      return t;
    });
  }

  get publicKey(): anchor.web3.PublicKey {
    return this.payer.publicKey;
  }
}
