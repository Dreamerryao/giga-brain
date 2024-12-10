import * as anchor from '@coral-xyz/anchor';

export const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';

export const ENV = IS_PROD ? 'mainnet' : 'devnet';

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

export const AVATARS_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars`;

export const ALLOW_USE_REAL_WALLET = true;

export const GIGA_MINT = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_GIGA_MINT!
);

export const GIGA_DECIMALS = 6;

export const SOL_DECIMALS = 9;

export const TOKENS = new Map([
  [
    'GIGA🧠',
    {
      mint: GIGA_MINT,
      decimals: GIGA_DECIMALS,
    },
  ],
  [
    'SOL',
    {
      mint: new anchor.web3.PublicKey(
        'So11111111111111111111111111111111111111112'
      ),
      decimals: SOL_DECIMALS,
    },
  ],
]);

export const TOKENS_LIST = Array.from(TOKENS.entries());

export const METADATA = '{}';

export const UI_COMMITMENT = 'processed';
