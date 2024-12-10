import { useEffect, useState, useMemo } from 'react';
import * as anchor from '@coral-xyz/anchor';

export type PDA = {
  account: anchor.web3.PublicKey | null;
  bump: number | null;
};
export type KnownPDA = { account: anchor.web3.PublicKey; bump: number }; // todo: better name

export function usePDA(
  programId: anchor.web3.PublicKey,
  seeds: Buffer[] | null
): PDA {
  const [account, setAccount] = useState<anchor.web3.PublicKey | null>(null);
  const [bump, setBump] = useState<number | null>(null);

  const pda = useMemo(() => ({ account, bump }), [account, bump]);

  useEffect(() => {
    if (!seeds) return;

    let isMounted = true;
    const unsubs = [
      () => {
        isMounted = false;
      },
    ];

    const loadPDA = async () => {
      const { account, bump } = await findPDA(programId, seeds);

      if (isMounted) {
        setAccount(account);
        setBump(bump);
      }
    };

    loadPDA();

    return () => unsubs.forEach((unsub) => unsub());
  }, [programId, seeds]);

  return pda;
}

export async function findPDA(
  programId: anchor.web3.PublicKey,
  seeds: Buffer[]
) {
  const [account, bump] = await anchor.web3.PublicKey.findProgramAddress(
    seeds,
    programId
  );
  return { account, bump };
}
