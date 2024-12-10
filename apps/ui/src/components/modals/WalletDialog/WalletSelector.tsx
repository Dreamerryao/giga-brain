import type { PropsWithChildren } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { useCallback, useMemo } from 'react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import {
  useWallet as useBaseWallet,
  Wallet,
} from '@solana/wallet-adapter-react';
import toast from '@aurory/react-hot-toast';
import bs58 from 'bs58';
import { CheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUI } from '@/providers/ui';
import { ALLOW_USE_REAL_WALLET, IS_PROD } from '@/config';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { useAirdropMutation } from '@/hooks/mutations/useAirdropMutation';
import { Loader } from '@/components/shared/Loader';
import { useProgress } from '@/hooks/useProgress';

export function WalletSelector() {
  const { wallets } = useBaseWallet();
  const {
    isLocalWallet: { isLocal },
    connectModal: { setIsOpened },
  } = useUI();
  const { localWallet } = useSolanaWallet();

  const solWallets = useMemo(() => {
    const installed: Wallet[] = [];
    const loadable: Wallet[] = [];
    const notDetected: Wallet[] = [];

    for (const wallet of wallets) {
      if (wallet.readyState === WalletReadyState.Installed) {
        installed.push(wallet);
      } else {
        if (wallet.readyState === WalletReadyState.NotDetected) {
          notDetected.push(wallet);
        } else if (wallet.readyState === WalletReadyState.Loadable) {
          loadable.push(wallet);
        }
      }
    }

    return [...installed, ...loadable, ...notDetected];
  }, [wallets]);

  const importWalletPrivKey = async () => {
    const privKeyString = prompt('Enter private key (base58)');
    if (privKeyString) {
      try {
        localWallet.setWallet(privKeyString);
        setIsOpened(false);
      } catch (e) {
        toast.error('Invalid private key');
      }
    }
  };

  return (
    <div className='flex flex-col justify-between w-full'>
      {isLocal ? (
        <>
          <p className='text-sm text-red-500 py-2'>
            This will be a test wallet to be used only for testing purposes.
          </p>

          <div className={'flex items-center gap-4 '}>
            <div className='w-full max-w-sm'>
              <GeneratePrivateKey />
            </div>
            <div className='justify-center my-1 hidden'>or</div>
            <div className='justify-center w-full max-w-sm hidden'>
              <Button
                className='w-full'
                onClick={importWalletPrivKey}
                data-testid='import-private-key'
              >
                Import private key
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className='space-y-3'>
            {solWallets.map((wallet) => (
              <SolanaWalletListItem key={wallet.adapter.name} wallet={wallet} />
            ))}
          </div>
        </>
      )}

      <IsLocalWalletSwitch />
    </div>
  );
}

function GeneratePrivateKey() {
  const airdrop = useAirdropMutation();
  const {
    connectModal: { setIsOpened },
  } = useUI();
  const { localWallet } = useSolanaWallet();

  const { isDone, done } = useProgress();

  const connectLocalWallet = async () => {
    const kp = anchor.web3.Keypair.generate();
    const privKeyString = bs58.encode(kp.secretKey);
    localWallet.setWallet(privKeyString);

    await done(async () => {
      try {
        await airdrop.mutateAsync(kp.publicKey);
      } catch (e) {
        console.error(e);
      }
    });

    setIsOpened(false);
  };

  return (
    <Button
      className='w-full'
      data-testid='generate-private-key'
      onClick={() => connectLocalWallet()}
    >
      {airdrop.isPending ? (
        <Loader text='Generating' />
      ) : isDone ? (
        <div className='flex gap-2 items-center'>
          Generated <CheckIcon size={16} />
        </div>
      ) : (
        <>Generate private key</>
      )}
    </Button>
  );
}

function SolanaWalletListItem({
  wallet,
  info,
}: {
  wallet?: Wallet;
  info?: { name: WalletName; icon: string; extensionUrl: string };
}) {
  const {
    connectModal: { setIsOpened },
  } = useUI();
  const { select } = useBaseWallet();

  const name = useMemo(
    () => wallet?.adapter.name ?? info?.name,
    [wallet?.adapter.name, info?.name]
  );

  const icon = useMemo(
    () => wallet?.adapter.icon ?? info?.icon,
    [wallet?.adapter.icon, info?.icon]
  );

  const installed = useMemo(
    () => wallet?.readyState === WalletReadyState.Installed,
    [wallet]
  );

  const handleWalletClick = useCallback(() => {
    if (!installed && info?.extensionUrl) {
      window.open(info.extensionUrl, '_blank');
    } else {
      if (name) {
        select(name);
      }
    }
    setIsOpened(false);
  }, [select, name, info?.extensionUrl, installed, setIsOpened]);

  return (
    <>
      <button
        onClick={() => handleWalletClick()}
        className={cn(
          'w-full p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50',
          'hover:bg-rose-500/5 hover:border-rose-500/20 transition-all duration-300',
          'group flex items-center justify-between'
        )}
      >
        <div className='flex items-center space-x-3'>
          <div
            className='w-10 h-10 rounded-full bg-zinc-800/50 p-2 
                group-hover:bg-rose-500/10 transition-colors'
          >
            <img src={icon} alt={name} className='w-full h-full' />
          </div>
          <div className='text-left'>
            <h3 className='font-medium text-white group-hover:text-rose-400 transition-colors'>
              {name}
            </h3>
            {/* <p className='text-sm text-zinc-400'>{description}</p> */}
          </div>
        </div>

        {installed && (
          <span className='text-[.875rem] opacity-[.6] uppercase font-barlow text-zinc-50'>
            Detected
          </span>
        )}

        {/* <ArrowRight
          className='w-5 h-5 text-zinc-400 group-hover:text-rose-400 
                      group-hover:translate-x-1 transition-all'
        /> */}
      </button>
    </>
  );
}

function IsLocalWalletSwitch() {
  const {
    isLocalWallet: { isLocal, setIsLocal },
  } = useUI();

  return IS_PROD || ALLOW_USE_REAL_WALLET ? null : (
    <div className='mt-6 flex w-full justify-end'>
      <WalletSwitch
        checked={isLocal ?? false}
        setChecked={setIsLocal}
        id='is-local-wallet-switch'
        label='Use local wallet'
      />
    </div>
  );
}

function WalletSwitch({
  checked,
  setChecked,
  id,
  children,
  label,
}: PropsWithChildren<{
  checked: boolean;
  setChecked: (checked: boolean) => void;
  id: string;
  label: string;
}>) {
  return (
    <div
      className={cn('flex items-center justify-end space-x-2 w-full', {
        'opacity-50': !checked,
      })}
    >
      {children}
      <Label htmlFor={id}>{label}</Label>
      <Switch
        id={id}
        defaultChecked={checked}
        onCheckedChange={setChecked}
        className={
          'data-[state=unchecked]:bg-zinc-950 data-[state=checked]:bg-zinc-950 [&>span]:bg-white'
        }
      />
    </div>
  );
}
