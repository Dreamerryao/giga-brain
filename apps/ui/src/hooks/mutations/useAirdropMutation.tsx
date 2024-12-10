import { useMutation } from '@tanstack/react-query';
import * as anchor from '@coral-xyz/anchor';
import { toLamports } from '@repo/lib/src/bn';

import { useSolanaConnection } from '@/providers/solana/connection';

export function useAirdropMutation() {
  const connection = useSolanaConnection();

  return useMutation({
    mutationFn: async (publicKey: anchor.web3.PublicKey) => {
      try {
        const signature = await connection.requestAirdrop(
          publicKey,
          toLamports(1, 9).toNumber()
        );
        await connection.confirmTransaction({
          signature,
          ...(await connection.getLatestBlockhash('processed')),
        });
      } catch (error) {
        window.open(
          `https://faucet.solana.com/?token=SOL&address=${publicKey.toBase58()}&network=devnet`,
          '_blank'
        );
      }
    },
  });
}
