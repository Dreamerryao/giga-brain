import { sleep } from '@repo/lib/src/promise';

import { GbProgram } from '@/lib/program/program';
import { disconnect } from '@/db';

import { CryptoBot } from './utils/tg';
import { Coingecko } from './utils/coingecko';
import { UsdUpdater } from './utils/usd-updater';

const JOB_DELAY = 1000 * 60 * 1;

main().catch(console.error);

async function main() {
  try {
    const gbProgram = await GbProgram.new();

    const bot = new CryptoBot(gbProgram);
    bot.start();

    const coingecko = await Coingecko.new(bot.announceTrade.bind(bot));
    const usdUpdater = await UsdUpdater.new(gbProgram);

    while (true) {
      await coingecko.run();
      await usdUpdater.run();
      await sleep(JOB_DELAY);
    }
  } finally {
    await disconnect();
  }
}
