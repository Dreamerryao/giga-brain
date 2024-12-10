import { sha256 } from '@noble/hashes/sha256';

export async function hashText(text: string): Promise<number[]> {
  return Array.from(sha256(Buffer.from(text, 'utf8')));
}
