'use client';

import { useUI } from '@/providers/ui';

import { WalletDialog } from './WalletDialog/WalletDialog';
import { Toast } from './Toast/Toast';
import { FaucetModal } from './FaucetModal';

export function Modals() {
  const { connectModal, faucetModal } = useUI();

  return (
    <>
      {!connectModal.isOpened ? null : <WalletDialog />}
      {!faucetModal.isOpened ? null : <FaucetModal />}
      <Toast />
    </>
  );
}
