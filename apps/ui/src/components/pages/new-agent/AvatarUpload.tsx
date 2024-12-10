import React, { useMemo } from 'react';
import { ImageIcon, Upload } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  value: File | null;
  onChange: (value: File | null) => void;
  defaultAvatar: string;
}

export function AvatarUpload({
  value,
  onChange,
  defaultAvatar,
}: AvatarUploadProps) {
  const avatarUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : defaultAvatar),
    [value, defaultAvatar]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className='space-y-2'>
      <label className='flex items-center space-x-2 text-sm font-medium text-zinc-300'>
        <div className='p-1.5 bg-rose-500/10 rounded-lg'>
          <ImageIcon className='w-4 h-4 text-rose-400' />
        </div>
        <span>Agent Avatar</span>
      </label>

      <div className='flex items-center space-x-4'>
        <div className='relative group'>
          <div className='absolute inset-0 bg-rose-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300' />
          <div className='relative size-20 m-2 rounded-xl object-cover bg-zinc-800 flex items-center justify-center'>
            <img
              src={avatarUrl}
              alt='Agent Avatar'
              className='relative size-[64px] m-2 rounded-xl object-cover '
            />
          </div>
        </div>

        <div className='flex-1'>
          <label
            className={cn(
              'flex flex-col items-center justify-center w-full h-20 rounded-xl',
              'border-2 border-dashed border-zinc-700/50 hover:border-rose-500/50',
              'bg-zinc-800/50 hover:bg-rose-500/5',
              'cursor-pointer transition-all duration-300'
            )}
          >
            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
              <Upload className='w-6 h-6 text-zinc-400 group-hover:text-rose-400 mb-2' />
              <p className='text-sm text-zinc-400 px-4'>
                <span className='font-medium text-rose-400'>
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className='text-xs text-zinc-500'>PNG, JPG up to 2MB</p>
            </div>
            <input
              type='file'
              className='hidden'
              accept='image/*'
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
