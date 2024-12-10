'use client';

import { useContext, createContext, PropsWithChildren, useState } from 'react';
import * as anchor from '@coral-xyz/anchor';

import { AgentPageItem, useAgentQuery } from '@/hooks/queries/useAgentQuery';
import { useAgentMessagesQuery } from '@/hooks/queries/useAgentMessagesQuery';
import { usePuzzleETA } from '@/hooks/usePuzzleETA';
import { useAttemptMutation } from '@/hooks/mutations/useAttemptMutation';

const AgentPageContext = createContext<{
  agent: AgentPageItem;
  attempts: ReturnType<typeof useAgentMessagesQuery>;
  pubkey: string;
  status: ReturnType<typeof usePuzzleETA>['status'];
  isInFinalTimer: ReturnType<typeof usePuzzleETA>['isInFinalTimer'];
  setShowFeeConfirmModal: (value: boolean) => void;
  showFeeConfirmModal: boolean;
  attemptMutation: ReturnType<typeof useAttemptMutation>;
  mint: anchor.web3.PublicKey;
  mode: 'global' | 'personal';
  setMode: (mode: 'global' | 'personal') => void;
} | null>(null);

export function AgentPageProvider({
  children,
  pubkey,
}: PropsWithChildren & { pubkey: string }) {
  const { data: agent } = useAgentQuery(pubkey);

  return !agent ? null : (
    <AgentPageProviderInner agent={agent} publicKey={pubkey}>
      {children}
    </AgentPageProviderInner>
  );
}

function AgentPageProviderInner({
  children,
  agent,
  publicKey,
}: PropsWithChildren & { agent: AgentPageItem; publicKey: string }) {
  const [mode, setMode] = useState<'global' | 'personal'>('global');

  const attempts = useAgentMessagesQuery(publicKey, mode);
  const eta = usePuzzleETA(agent);
  const attemptMutation = useAttemptMutation();
  const [showFeeConfirmModal, setShowFeeConfirmModal] = useState(false);

  return (
    <AgentPageContext.Provider
      value={{
        agent,
        attempts,
        pubkey: publicKey,
        status: eta.status,
        isInFinalTimer: eta.isInFinalTimer,
        setShowFeeConfirmModal,
        showFeeConfirmModal,
        attemptMutation,
        mint: agent.mint,
        mode,
        setMode,
      }}
    >
      {children}
    </AgentPageContext.Provider>
  );
}

export function useAgentPage() {
  const context = useContext(AgentPageContext);
  if (!context) {
    throw new Error('Missing AgentPage context');
  }
  return context;
}
