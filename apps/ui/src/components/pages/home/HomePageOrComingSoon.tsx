'use client';

import { useEffect } from 'react';

import { useUI } from '@/providers/ui';

import { ComingSoon } from './ComingSoon/ComingSoon';
import { HomePageInner } from './HomePage';

export function HomePageOrComingSoon() {
  const { release } = useUI();

  useEffect(() => {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
      pageLoader.style.display = 'none';
    }
  }, []);

  return !release.isReleased ? <ComingSoon /> : <HomePageInner />;
}
