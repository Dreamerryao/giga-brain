import React, { PropsWithChildren } from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export function FormField({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  min,
  step,
  options,
  children,
  autoFocus,
  className,
}: PropsWithChildren<{
  icon: LucideIcon;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
  options?: Array<{ value: string; label: string }>;
  autoFocus?: boolean;
  className?: string;
}>) {
  const inputClasses = cn(
    'w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3',
    'text-white placeholder-zinc-500',
    'focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent',
    'transition-all duration-300 [&>option]:bg-zinc-800'
  );

  return (
    <div className='space-y-2'>
      <label className='flex items-center space-x-2 text-sm font-medium text-zinc-300'>
        <div className='p-1.5 bg-rose-500/10 rounded-lg'>
          <Icon className='w-4 h-4 text-rose-400' />
        </div>
        <span>{label}</span>
      </label>
      {children || (
        <>
          {type === 'textarea' ? (
            <textarea
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              rows={4}
              className={cn(
                inputClasses,
                'resize-none w-full flex-1 h-full',
                className
              )}
              aria-multiline
              autoFocus={autoFocus}
            />
          ) : type === 'select' ? (
            <select
              value={value}
              onChange={onChange}
              required={required}
              autoFocus={autoFocus}
              className={cn(inputClasses, className)}
            >
              <option value=''>Select {label}</option>
              {options?.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              min={min}
              step={step}
              className={cn(inputClasses, className)}
              autoFocus={autoFocus}
            />
          )}
        </>
      )}
    </div>
  );
}
