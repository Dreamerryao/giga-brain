import React from 'react';
import { Users, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ChatMode } from '@/types';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';

import { useAgentPage } from './AgentPageProvider';

const MODELS = [
  {
    name: 'Global Chat',
    value: 'global' as ChatMode,
    icon: Users,
  },
  {
    name: 'My Chat',
    value: 'personal' as ChatMode,
    icon: User,
  },
];

export function ChatModeToggle() {
  const { publicKey } = useSolanaWallet();
  const { mode, setMode } = useAgentPage();

  return !publicKey ? null : (
    <div className='flex items-center space-x-2 bg-zinc-800/50 rounded-xl p-1'>
      {MODELS.map(({ icon: Icon, value, name }) => (
        <button
          key={value}
          onClick={() => setMode(value)}
          className={cn(
            'flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all',
            mode === value
              ? 'bg-rose-500/10 text-rose-400'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          <Icon className='w-4 h-4' />
          <span className='text-sm font-medium'>{name}</span>
        </button>
      ))}
    </div>
  );
}
