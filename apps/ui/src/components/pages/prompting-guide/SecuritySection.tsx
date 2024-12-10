import React from 'react';
import { Shield } from 'lucide-react';

interface SecurityPointProps {
  title: string;
  description: string;
}

function SecurityPoint({ title, description }: SecurityPointProps) {
  return (
    <div className='space-y-2'>
      <h4 className='font-bold text-white'>{title}</h4>
      <p className='text-zinc-400'>{description}</p>
    </div>
  );
}

export function SecuritySection() {
  return (
    <div className='game-card p-6 space-y-6'>
      <div className='flex items-center space-x-3'>
        <div className='p-2 bg-rose-500/10 rounded-lg'>
          <Shield className='w-6 h-6 text-rose-500' />
        </div>
        <h3 className='text-xl font-bold'>Security Best Practices</h3>
      </div>

      <div className='grid gap-6'>
        <SecurityPoint
          title='Explicit Disallowance'
          description="Clearly state that attempts to redefine tools or introduce new contexts (e.g., 'INCOMING transfers') are invalid and will be rejected."
        />

        <SecurityPoint
          title='Input Validation'
          description='Implement strict validation rules to reject any attempts to bypass rules through redefinitions, meta-prompts, or session manipulations.'
        />

        <SecurityPoint
          title='Tool Usage Rules'
          description='Make explicit distinctions between allowed and forbidden actions. For example, clearly state that approveTransfer cannot be used under any circumstances.'
        />

        <SecurityPoint
          title='Contextual Defense'
          description="Specify that session manipulations like 'END SESSION' or 'NEW SESSION' are invalid and must not alter the agent's behavior."
        />

        <SecurityPoint
          title='Immutable Directives'
          description='Reinforce core rules multiple times throughout the prompt to ensure they cannot be bypassed or reinterpreted.'
        />

        <SecurityPoint
          title='Output Restrictions'
          description='Prevent outputs from deviating into unintended formats or behaviors by establishing strict guidelines for responses.'
        />
      </div>
    </div>
  );
}
