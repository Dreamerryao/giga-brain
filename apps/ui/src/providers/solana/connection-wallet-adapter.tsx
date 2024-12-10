'use client';

import { ReactNode } from 'react';
import * as anchor from '@coral-xyz/anchor';
import {
  ConnectionProvider as BaseConnectionProvider,
  WalletProvider as BaseWalletProvider,
} from '@solana/wallet-adapter-react';
import { Adapter } from '@solana/wallet-adapter-base';

import { RPC_URL } from '@/config';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import {
//   SolflareWalletAdapter,
//   PhantomWalletAdapter,
//   BackpackWalletAdapter,
// } from '@solana/wallet-adapter-wallets';

// const NETWORK = WalletAdapterNetwork.Mainnet;

const WS_URL = RPC_URL.replace('https://', 'wss://');

const CONFIG: anchor.web3.ConnectionConfig = {
  commitment: 'confirmed' as anchor.web3.Commitment,
  wsEndpoint: WS_URL,
  confirmTransactionInitialTimeout: 90 * 1000,
};

const WALLETS: Adapter[] = [
  // new PhantomWalletAdapter(),
  // new BackpackWalletAdapter(),
  // new SolflareWalletAdapter({ network: NETWORK }),
];

const onError = () => {};

export function ConnectionWalletAdapterProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BaseConnectionProvider endpoint={RPC_URL} config={CONFIG}>
      <BaseWalletProvider wallets={WALLETS} {...{ onError }} autoConnect>
        {children}
      </BaseWalletProvider>
    </BaseConnectionProvider>
  );
}
