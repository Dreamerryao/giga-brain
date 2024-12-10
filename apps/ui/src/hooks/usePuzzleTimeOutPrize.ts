import * as anchor from '@coral-xyz/anchor';

import { Tables } from '@/lib/db-types';

import { usePuzzleCurrencyQuery } from './queries/usePuzzleCurrencyQuery';

interface Puzzle {
  total_fees_paid: Tables<'puzzle'>['total_fees_paid'];
  initial_prize: Tables<'puzzle'>['initial_prize'];
  mint: anchor.web3.PublicKey;
}

export function usePuzzleTimeOutPrize(puzzle: Puzzle) {
  const { data: puzzleCurrency } = usePuzzleCurrencyQuery(puzzle.mint);

  const fees =
    puzzle.total_fees_paid *
    (1 - (puzzleCurrency?.service_fee_bps ?? 0) / 10000);

  return {
    fees,
    total: fees + puzzle.initial_prize,
  };
}
