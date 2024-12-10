'use client';

import {
  useAnchorWallet,
  useWallet as useBaseWallet,
} from '@solana/wallet-adapter-react';

import { Wallet } from './types';

export function useUIWallet(): Wallet {
  const wallet = useAnchorWallet();
  const { signMessage, signTransaction, disconnect, connect } = useBaseWallet();

  return {
    publicKey: wallet?.publicKey ?? null,
    signMessage,
    signTransaction,
    disconnect,
    connect,
  };
}
