import { router } from '@/trpc/trpc';

import { initCreatePuzzle } from './procedures/init-create-puzzle';
import { finalizeCreatePuzzle } from './procedures/finalize-create-puzzle';
import { initRecordAttempt } from './procedures/init-record-attempt';
import { finalizeRecordAttempt } from './procedures/finalize-record-attempt';
import { claimTimeout } from './procedures/claim-timeout';
import { claimPrize } from './procedures/claim-prize';
import { faucet } from './procedures/faucet';
export const appRouter = router({
  initCreatePuzzle,
  finalizeCreatePuzzle,
  initRecordAttempt,
  finalizeRecordAttempt,
  claimPrize,
  claimTimeout,
  faucet,
});

export type AppRouter = typeof appRouter;
