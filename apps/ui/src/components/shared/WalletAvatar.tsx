'use client';

import React, { useEffect, useRef } from 'react';
import jazzicon from '@metamask/jazzicon';

interface WalletAvatarProps {
  address: string;
  size?: number;
}

export function WalletAvatar({ address, size = 32 }: WalletAvatarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = '';
      ref.current.appendChild(
        jazzicon(size, parseInt(address.slice(2, 10), 16))
      );
    }
  }, [address, size]);

  return (
    <div
      ref={ref}
      className='rounded-full overflow-hidden hover:scale-110 transition-transform duration-300'
      style={{ width: size, height: size }}
    />
  );
}
