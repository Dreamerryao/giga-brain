import * as anchor from '@coral-xyz/anchor';
import { getKeyFromEnvOrFile } from '@repo/lib/src/program/provider';

export const GIGA_MINT = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_GIGA_MINT!
);

export const GIGA_DECIMALS = 6;

export const TEST_ADMIN_KEY = getKeyFromEnvOrFile('TEST_ADMIN_KEY');

export const TEST_CREATOR_KEY = getKeyFromEnvOrFile('TEST_CREATOR_KEY');

export const TEST_SOLVER_KEY = getKeyFromEnvOrFile('TEST_SOLVER_KEY');

export const TEST_PROMPTS_VERIFIER_KEY = getKeyFromEnvOrFile(
  'PROMPTS_VERIFIER_KEY'
);

export const TEST_PUZZLES_VERIFIER_KEY = getKeyFromEnvOrFile(
  'PUZZLES_VERIFIER_KEY'
);
