'use client';

import React from 'react';
import { Copy } from 'lucide-react';

import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, title }: CodeBlockProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className='relative group'>
      {title && (
        <div className='absolute -top-3 left-4 px-2 py-0.5 bg-zinc-800 rounded-md text-sm text-zinc-400 z-50'>
          {title}
        </div>
      )}
      <div
        className={cn(
          'relative mt-2 p-4 bg-zinc-800/50 rounded-xl  text-sm overflow-x-auto',
          'border border-zinc-700/50'
        )}
      >
        <button
          onClick={copyToClipboard}
          className='absolute top-2 right-2 p-2 rounded-lg opacity-0 group-hover:opacity-100
                   bg-zinc-700/50 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400
                   transition-all duration-200'
        >
          <Copy className='w-4 h-4' />
        </button>
        <pre className='text-zinc-300 whitespace-pre-wrap'>{code}</pre>
      </div>
    </div>
  );
}
