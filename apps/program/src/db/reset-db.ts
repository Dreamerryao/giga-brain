import { db } from '@/db';

import {
  game,
  puzzle,
  playerActivity,
  puzzleAttempt,
  puzzleMessage,
  txns,
  verifierTxns,
  playerActivityLog,
  puzzleCurrency,
  playerCurrencyStats,
} from './schema';

main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Done ✅');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

async function main() {
  await db.delete(puzzleAttempt);
  await db.delete(puzzleMessage);
  await db.delete(playerActivityLog);
  await db.delete(playerCurrencyStats);
  await db.delete(puzzleCurrency);
  await db.delete(puzzle);
  await db.delete(playerActivity);
  await db.delete(game);
  await db.delete(txns);
  await db.delete(verifierTxns);
}
