import { KEY_CACHE } from './cache';

export function get() {
  return KEY_CACHE();
}

export function set(privateKey: string | null) {
  KEY_CACHE(privateKey || null);
}

export function clear() {
  set(null);
}
