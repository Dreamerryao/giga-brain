import { useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/lib/src/supabase';
import * as anchor from '@coral-xyz/anchor';
import { useMemo } from 'react';

import { Tables } from '@/lib/db-types';

export type PuzzleCurrency = {
  base_fee: Tables<'puzzle_currency'>['base_fee'];
  max_fee: Tables<'puzzle_currency'>['max_fee'];
  minimum_initial_prize: Tables<'puzzle_currency'>['minimum_initial_prize'];
  service_fee_bps: Tables<'puzzle_currency'>['service_fee_bps'];
};

export function usePuzzleCurrencyQuery(mint: anchor.web3.PublicKey) {
  const mintString = useMemo(() => mint.toBase58(), [mint]);

  return useQuery({
    queryKey: ['usePuzzleCurrencyQuery', mintString],
    queryFn: async () => {
      const { data } = await supabase
        .from('puzzle_currency')
        .select(
          `
            base_fee,
            max_fee,
            minimum_initial_prize,
            service_fee_bps
          `
        )
        .eq('mint', mintString)
        .limit(100);
      if (!data) return null;
      const puzzleCurrency: PuzzleCurrency = data[0];
      return puzzleCurrency;
    },
  });
}
