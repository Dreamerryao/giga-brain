'use client';

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import * as anchor from '@coral-xyz/anchor';
import BigNumber from 'bignumber.js';
import { formatNumber, toBigNumber } from '@repo/lib/src/bn';

import { useSOLBalanceQuery } from '@/hooks/queries/useSOLBalanceQuery';
import { useUI } from '@/providers/ui';
import { useTokenAccountBalanceQuery } from '@/hooks/queries/useTokenAccountBalanceQuery';
import useMintTokenPDA from '@/hooks/useMintTokenPDA';
import { GIGA_MINT, IS_PROD } from '@/config';
import { SetStatusFn } from '@/hooks/useStatus';

import { useSolanaConnection } from '../connection';

import { useUIWallet } from './wallet-ui';
import { useLocalWallet } from './wallet-local';
import { LocalWallet, Wallet } from './types';

type UiSignAndSendTxOpts = {
  ixs?: anchor.web3.TransactionInstruction[];
  signers?: Array<anchor.web3.Signer | undefined>;
  opts?: anchor.web3.ConfirmOptions;
  tx?: anchor.web3.Transaction;
  setStatus: SetStatusFn;
};

type UiSignMessageOpts = {
  msg: Uint8Array;
  setStatus: SetStatusFn;
};

type UiSignTxOpts = {
  tx: anchor.web3.Transaction;
  setStatus: SetStatusFn;
};

const WalletContext = createContext<{
  provider: anchor.AnchorProvider | null;
  wallet: Wallet | null;
  localWallet: LocalWallet;
  uiWallet: Wallet;
  publicKey: anchor.web3.PublicKey | null;
  solBalance: BigNumber;
  gigaBalance: BigNumber;
  uiSignAndSendTx: (opts: UiSignAndSendTxOpts) => Promise<string | null>;
  uiSignMessage: (opts: UiSignMessageOpts) => Promise<Uint8Array | null>;
  uiSignTx: (opts: UiSignTxOpts) => Promise<anchor.web3.Transaction>;
} | null>(null);

export function WalletProvider({ children }: PropsWithChildren) {
  const connection = useSolanaConnection();
  const {
    isLocalWallet: { isLocal },
    connectModal: { setIsOpened },
  } = useUI();

  const uiWallet = useUIWallet();
  const localWallet = useLocalWallet();

  const wallet = useMemo(
    () => (isLocal ? localWallet : uiWallet) || null,
    [isLocal, localWallet, uiWallet]
  );

  const publicKey = useMemo(() => wallet?.publicKey ?? null, [wallet]);

  const provider = useMemo(
    () =>
      !(connection && wallet)
        ? null
        : new anchor.AnchorProvider(
            connection,
            wallet as unknown as anchor.Wallet,
            {
              commitment: 'confirmed',
            }
          ),
    [connection, wallet]
  );

  const solBalance = useSOLBalanceQuery(publicKey);
  const gigaTokenAccount = useMintTokenPDA(GIGA_MINT, publicKey);
  const gigaBalance = useTokenAccountBalanceQuery(gigaTokenAccount);

  const uiSignAndSendTx = useCallback(
    async ({ ixs, setStatus, ...extraOpts }: UiSignAndSendTxOpts) => {
      try {
        if (!wallet?.signTransaction) {
          setIsOpened(true);
          throw new Error('Connect wallet');
        }

        let { signers, opts, tx } = extraOpts;

        setStatus({
          status: 'prompting',
        });

        if (tx || ixs) {
          if (!(provider && publicKey))
            throw new Error('Missing provider or walletPubkey.');

          // lifted from anchor
          // so we can better capture tx statuses: prompting vs sending
          const { connection, opts: defaultOpts } = provider;

          if (signers === undefined) {
            signers = [];
          }
          if (opts === undefined) {
            opts = defaultOpts;
          }

          if (!tx) {
            tx = new anchor.web3.Transaction();
            if (ixs) tx.add(...ixs);
          }

          const fee = toBigNumber(await tx.getEstimatedFee(connection));
          if (solBalance.lt(fee)) {
            throw new Error(
              `Require min SOL: ${formatNumber(toBigNumber(fee).div(1e9), 6)}. ${
                IS_PROD ? '' : 'Get some from Faucet in the Wallet menu.'
              }`
            );
          }

          const originalSignatures = Object.assign(
            [],
            tx.signatures
          ) as anchor.web3.SignaturePubkeyPair[];
          const filteredSignatures = originalSignatures.filter(
            (item) => item.signature != null
          );
          const signedTx = await wallet.signTransaction(tx);
          if (!signedTx) throw new Error('Transaction not signed');

          tx = signedTx;

          signers
            .filter((s): s is anchor.web3.Signer => s !== undefined)
            .forEach((kp) => {
              tx!.partialSign(kp);
            });

          filteredSignatures.forEach((sign) => {
            tx!.addSignature(sign.publicKey, sign.signature as Buffer);
          });

          const rawTx = tx.serialize();

          setStatus({
            status: 'sending',
          });
          const signature = await connection.sendRawTransaction(rawTx, opts);
          const latestBlockHash =
            await connection.getLatestBlockhash('processed');
          await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature,
          });
          setStatus({ status: 'sent', data: signature });
          return signature;
        }

        throw new Error('Provide tx or ixs or fn');
      } catch (ex) {
        let e = ex as Error;
        let logs: string[] = [];

        if (ex instanceof anchor.web3.SendTransactionError) {
          const sendTransactionError = ex as anchor.web3.SendTransactionError;
          if (sendTransactionError.logs) {
            logs = sendTransactionError.logs;
            // remove log once sentry plan is upgraded
            console.error(logs); // eslint-disable-line no-console
            for (const log of sendTransactionError.logs) {
              if (~log.search('insufficient lamports')) {
                const m = log.match(
                  /Transfer: insufficient lamports (\d+), need (\d+)/
                );
                let errMessage = 'Not enough SOL';
                if (m && m.length === 3) {
                  const solRequired = parseInt(m[2]);
                  if (solRequired) {
                    errMessage += `: ${formatNumber(toBigNumber(solRequired).div(1e9), 4)}`;
                  }
                }
                e = new Error(errMessage);
                break;
              }
            }
          }
        }

        throw e;
      }
    },
    [provider, solBalance, publicKey, wallet, setIsOpened]
  );

  const uiSignMessage = useCallback(
    async ({ msg, setStatus }: UiSignMessageOpts) => {
      if (!wallet?.signMessage) throw new Error('Connect wallet');
      if (!publicKey) throw new Error('Connect wallet');
      setStatus({ status: 'signing' });
      return await wallet.signMessage(msg);
    },
    [wallet, publicKey]
  );

  const uiSignTx = useCallback(
    async ({ tx, setStatus }: UiSignTxOpts) => {
      if (!wallet?.signTransaction) throw new Error('Connect wallet');
      if (!publicKey) throw new Error('Connect wallet');
      setStatus({ status: 'signing' });
      const signedTx = await wallet.signTransaction(tx);
      if (!signedTx) throw new Error('Transaction not signed');
      return signedTx;
    },
    [wallet, publicKey]
  );

  useEffect(() => {
    if (!provider) return;
    anchor.setProvider(provider);
  }, [provider]);

  return (
    <WalletContext.Provider
      value={{
        provider,
        uiWallet,
        localWallet,
        wallet,
        publicKey,
        solBalance,
        gigaBalance,
        uiSignAndSendTx,
        uiSignMessage,
        uiSignTx,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useSolanaWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing SolanaWallet context');
  }
  return context;
}
