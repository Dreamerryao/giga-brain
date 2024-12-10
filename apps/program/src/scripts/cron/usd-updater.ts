import { GbProgram } from '@/lib/program/program';
import { disconnect } from '@/db';

import { UsdUpdater } from './utils/usd-updater';

main().catch(console.error);

async function main() {
  try {
    const gbProgram = await GbProgram.new();

    const usdUpdater = await UsdUpdater.new(gbProgram);
    await usdUpdater.run();
  } finally {
    await disconnect();
  }
}
