import fs from 'fs';

import bs58 from 'bs58';
import * as anchor from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

export const COMMITMENT = 'confirmed';

export async function getProvider(keypair: anchor.web3.Keypair) {
  const provider = new anchor.AnchorProvider(
    new anchor.web3.Connection(
      process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL!,
      COMMITMENT
    ),
    new NodeWallet(keypair),
    {
      commitment: COMMITMENT,
      preflightCommitment: COMMITMENT,
    }
  );
  anchor.setProvider(provider);
  return provider;
}

export function getPromptsVerifierKey() {
  return getKeyFromEnvOrFile('PROMPTS_VERIFIER_KEY');
}

export function getKeyFromEnvOrFile(env: string) {
  const k = process.env[env]!;
  const exists = fs.existsSync(k);
  if (!(k || exists)) {
    throw new Error(`${env} not found`);
  }
  return anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(
      exists ? JSON.parse(fs.readFileSync(k, 'utf-8')) : bs58.decode(k)
    )
  );
}
