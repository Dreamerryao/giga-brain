import { ENV } from '@/config';

export const KEY_CACHE = cache<string | null>('key');

export const IS_LOCAL_WALLET_CACHE = cache<boolean | null>('is_local_wallet');

export function cache<T>(k: string): (v?: T) => T | null {
  k = `gb:${ENV}:${k}`;
  return function (v?: T): T | null {
    if (typeof window !== 'undefined') {
      switch (arguments.length) {
        case 1:
          if (v === null) {
            window.localStorage.removeItem(k);
          } else {
            window.localStorage.setItem(k, JSON.stringify(v));
          }

        default:
          try {
            return JSON.parse(window.localStorage.getItem(k)!) as T;
          } catch (e) {
            console.error(e);
          }
      }
    }

    return null;
  };
}
