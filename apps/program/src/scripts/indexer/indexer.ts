import { Command } from 'commander';
import { sleep } from '@repo/lib/src/promise';

import { Indexer } from '@/lib/indexer/indexer';
import { GbProgram } from '@/lib/program/program';
import { VerifierIndexer } from '@/lib/indexer/verifier';

const JOB_DELAY = 1000 * 1;

main()
  .then(() => {
    console.log('Done ✅');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

export async function main() {
  let mode: string | null = null;

  const program = new Command();
  program
    .description('Start the indexer')
    .argument('<mode>', 'Indexer mode')
    .action((m) => {
      mode = m;
    });
  program.parse();
  if (!mode) {
    throw new Error('Mode is required');
  }
  if (!['verifier', 'indexer'].includes(mode)) {
    throw new Error(`Invalid mode: ${mode}`);
  }

  const gbProgram = await GbProgram.new();
  const index = await (mode === 'verifier' ? VerifierIndexer : Indexer).new({
    gbProgram,
  });

  await index();

  const queue: number[] = [];
  gbProgram.program.provider.connection.onLogs(
    gbProgram.program.programId,
    async (logs, ctx) => {
      console.log({
        logs,
        ctx,
      });
      queue.push(0);
    }
  );

  setInterval(() => {
    queue.push(0);
  }, 10_000);

  while (true) {
    if (queue.length > 0) {
      try {
        await index();
      } catch (err) {
        console.error(err);
      }
      queue.shift();
    } else {
      console.log('No logs to process');
    }
    await sleep(JOB_DELAY);
  }
}
