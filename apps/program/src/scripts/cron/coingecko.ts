import { disconnect } from '@/db';

import { Coingecko } from './utils/coingecko';

main().catch(console.error);

async function main() {
  try {
    const coingecko = await Coingecko.new(async () => {});
    await coingecko.run();
  } finally {
    await disconnect();
  }
}
