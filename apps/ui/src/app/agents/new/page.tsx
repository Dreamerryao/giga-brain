import { supabase } from '@repo/lib/src/supabase';
import * as anchor from '@coral-xyz/anchor';
import { NATIVE_MINT } from '@solana/spl-token';
import { AVAILABLE_MODELS } from '@repo/lib/src/llm';

import { PageLayout } from '@/components/shared/PageLayout';
import { GIGA_MINT } from '@/config';
import { NewAgentDialog } from '@/components/pages/new-agent/NewAgentDialog';
import { Tables } from '@/lib/db-types';

export type CreatePuzzleGame = {
  puzzle_attempt_timeout_seconds: Tables<'game'>['puzzle_attempt_timeout_seconds'];
  puzzle_attempt_final_timeout_seconds: Tables<'game'>['puzzle_attempt_final_timeout_seconds'];
  max_attempts: Tables<'game'>['max_attempts'];
};

export type CreatePuzzleCurrency = {
  base_fee: Tables<'puzzle_currency'>['base_fee'];
  max_fee: Tables<'puzzle_currency'>['max_fee'];
  minimum_initial_prize: Tables<'puzzle_currency'>['minimum_initial_prize'];
  service_fee_bps: Tables<'puzzle_currency'>['service_fee_bps'];
};

export default async function NewAgentPage() {
  const [game, gigaPuzzleCurrency, solPuzzleCurrency] = await Promise.all([
    getGame(),
    getPuzzleCurrency(GIGA_MINT),
    getPuzzleCurrency(NATIVE_MINT),
  ]);

  return (
    <PageLayout>
      {!game || !gigaPuzzleCurrency || !solPuzzleCurrency ? (
        <div>Error loading parameters</div>
      ) : (
        <NewAgentDialog
          models={AVAILABLE_MODELS}
          game={game}
          gigaPuzzleCurrency={gigaPuzzleCurrency}
          solPuzzleCurrency={solPuzzleCurrency}
        />
      )}
    </PageLayout>
  );
}

async function getGame(): Promise<CreatePuzzleGame | null> {
  const { data } = await supabase
    .from('game')
    .select(
      `
            puzzle_attempt_timeout_seconds,
            puzzle_attempt_final_timeout_seconds,
            max_attempts
          `
    )
    .limit(1);
  if (!data) return null;
  const game: CreatePuzzleGame = data[0];
  return game;
}

async function getPuzzleCurrency(
  mint: anchor.web3.PublicKey
): Promise<CreatePuzzleCurrency | null> {
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
    .eq('mint', mint.toBase58());
  if (!data) return null;
  const puzzleCurrency: CreatePuzzleCurrency = data[0];
  return puzzleCurrency;
}
