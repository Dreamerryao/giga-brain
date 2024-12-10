import React, { useState } from 'react';
import {
  Brain,
  Clock,
  Coins,
  Settings2Icon,
  Shield,
  WalletIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';
import { Loader } from '@/components/shared/Loader';
import { useCreateAgentMutation } from '@/hooks/mutations/useCreateAgentMutation';
import { cn } from '@/lib/utils';
import { TOKENS } from '@/config';
import { CreatePuzzleCurrency, CreatePuzzleGame } from '@/app/agents/new/page';

import { FormField } from './FormField';
import { AvatarUpload } from './AvatarUpload';
import { ConfirmAgentCreation } from './ConfirmAgentCreation';
import { PayoutCalculator } from './PayoutCalculator';

const TOKEN_SYMBOLS = Array.from(TOKENS.keys());

const TIMER_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} hour${i + 1 > 1 ? 's' : ''}`,
}));

export interface IModel {
  company: string;
  models: string[];
}

export function NewAgentForm({
  models,
  game,
  gigaPuzzleCurrency,
  solPuzzleCurrency,
}: {
  models: IModel[];
  game: CreatePuzzleGame;
  gigaPuzzleCurrency: CreatePuzzleCurrency;
  solPuzzleCurrency: CreatePuzzleCurrency;
}) {
  const { publicKey: creatorPubkey } = useSolanaWallet();

  const mutation = useCreateAgentMutation(
    game,
    gigaPuzzleCurrency,
    solPuzzleCurrency
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    setFormData,
    formData,
    defaultAvatar,
    isPending,
    mint,
    decimals,
    puzzleCurrency,
  } = mutation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleChange =
    (field: keyof typeof formData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleAvatarChange = (value: File | null) => {
    setFormData((prev) => ({ ...prev, avatar: value }));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='flex flex-col gap-4 lg:gap-12 lg:grid lg:grid-cols-2 lg:mb-12'>
          <div className='flex flex-col gap-4'>
            <AvatarUpload
              value={formData.avatar}
              onChange={handleAvatarChange}
              defaultAvatar={defaultAvatar}
            />

            <FormField
              icon={Brain}
              label='Agent Name'
              type='text'
              value={formData.name}
              onChange={handleChange('name')}
              placeholder='Enter a unique name for your agent...'
              required
              autoFocus
            />

            <div className='flex items-center space-x-2'>
              <div className='flex gap-2 flex-grow'>
                <div className='flex-grow'>
                  <FormField
                    icon={Coins}
                    label={`Initial Funds (${formData.currency})`}
                    type='number'
                    value={formData.funds}
                    onChange={handleChange('funds')}
                    placeholder={`Enter amount in ${formData.currency}...`}
                    min='0.0001'
                    step='0.0001'
                    required
                  />
                </div>
                <div className='flex flex-col'>
                  <div className='flex items-center justify-center h-14'>
                    &nbsp;
                  </div>
                  <div className='flex h-full'>
                    {TOKEN_SYMBOLS.map((t, index) => (
                      <button
                        key={t}
                        type='button'
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            currency: t as 'SOL' | 'GIGA🧠',
                          }))
                        }
                        className={cn(
                          'px-4  border transition-all duration-300 w-24',
                          formData.currency === t
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-rose-500/5',
                          index === 0 ? 'rounded-l-xl' : 'rounded-r-xl'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <FormField
              icon={Settings2Icon}
              label='Model'
              type='text'
              value={formData.model}
              onChange={handleChange('model')}
              placeholder='Enter model...'
              required
            >
              <select
                className={cn(
                  'w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3',
                  'text-white placeholder-zinc-700',
                  'focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent',
                  'transition-all duration-300'
                )}
              >
                {/* <option value={'random'}>Random</option> */}
                {models.map((model) => (
                  <optgroup label={model.company} key={model.company}>
                    {model.models.map((model) => (
                      <option key={model}>{model}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FormField>

            <div className='flex flex-col lg:flex-row gap-4'>
              <FormField
                icon={Coins}
                label='Base Fee'
                type='number'
                value={formData.baseFee}
                onChange={handleChange('baseFee')}
                placeholder='Initial attempt fee...'
                min='0.0001'
                step='0.0001'
                required
              />

              <FormField
                icon={Coins}
                label='Max Fee'
                type='number'
                value={formData.maxFee}
                onChange={handleChange('maxFee')}
                placeholder='Maximum fee cap...'
                min='0.0001'
                step='0.0001'
                required
              />

              <FormField
                icon={Coins}
                label='Max Attempts Before Final Timer'
                type='number'
                value={formData.maxAttempts}
                onChange={handleChange('maxAttempts')}
                placeholder='Maximum number of attempts...'
                min='1'
                step='1'
                required
              />
            </div>

            <div className='flex flex-col lg:flex-row gap-4'>
              <FormField
                icon={Clock}
                label='Normal Timer'
                type='select'
                value={formData.attemptTimeoutHours}
                onChange={handleChange('attemptTimeoutHours')}
                options={TIMER_OPTIONS}
                required
              />

              <FormField
                icon={Clock}
                label='Final Timer'
                type='select'
                value={formData.attemptFinalTimeoutHours}
                onChange={handleChange('attemptFinalTimeoutHours')}
                options={TIMER_OPTIONS}
                required
              />
            </div>

            <PayoutCalculator
              baseFee={Number(formData.baseFee)}
              maxFee={Number(formData.maxFee)}
              maxAttempts={Number(formData.maxAttempts)}
              mint={mint}
              serviceFee={Number(puzzleCurrency?.service_fee_bps ?? 0) / 10000}
              decimals={decimals}
            />
          </div>

          <FormField
            icon={Shield}
            label='System Prompt'
            type='textarea'
            value={formData.prompt}
            onChange={handleChange('prompt')}
            placeholder="Define your agent's personality and rules..."
            required
          />
        </div>

        <Button
          type='submit'
          className='game-button w-full group'
          disabled={!!isPending}
        >
          {!creatorPubkey ? (
            <>
              Connect Wallet <WalletIcon className='w-5 h-5' />
            </>
          ) : (
            <span className='relative z-10 flex items-center justify-center text-white'>
              {isPending ? <Loader text='Creating Agent...' /> : 'Create Agent'}
              <Brain className='w-5 h-5 ml-2 group-hover:rotate-12 transition-transform' />
            </span>
          )}
        </Button>
      </form>

      <ConfirmAgentCreation
        mutation={mutation}
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        mint={mint}
        decimals={decimals}
        creatorShare={1 - (puzzleCurrency?.service_fee_bps ?? 0) / 10000}
      />
    </>
  );
}
