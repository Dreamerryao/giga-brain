import * as anchor from '@coral-xyz/anchor';
import { IDL } from '@repo/lib/src/program/program';
import {
  type ExecEventFnOpts,
  type ExecParsedIxFnOpts,
  type ExecPartiallyDecodedIxFnOpts,
  indexAccount,
  TxnsTable,
} from 'solana-anchor-indexer';

import { GbProgram } from '@/lib/program/program';
import { db as drizzleDb } from '@/db';

export function makeIndexer({
  gbProgram,
  txnsTable,
  processIx,
  processEvent,
}: {
  gbProgram: GbProgram;
  txnsTable: TxnsTable;
  processIx: (opts: ExecPartiallyDecodedIxFnOpts) => Promise<void>;
  processEvent: (opts: ExecEventFnOpts) => Promise<void>;
}) {
  const programId = gbProgram.program.programId.toString();

  return async () => {
    await indexAccount({
      db: drizzleDb,
      debug: true,
      provider: gbProgram.program.provider,
      pubKey: new anchor.web3.PublicKey(programId),
      programs: new Map([[programId, IDL]]),
      txnsTable: txnsTable,
      execParsedIx: async (opts: ExecParsedIxFnOpts) => {
        console.log('execParsedIx');
        console.log(JSON.stringify(opts.ix, null, 2));
      },
      execPartiallyDecodedIx: async (opts: ExecPartiallyDecodedIxFnOpts) => {
        console.log('execPartiallyDecodedIx');
        console.log(JSON.stringify(opts.ix, null, 2));
        switch (opts.ix.programId) {
          case programId:
            await processIx(opts);
            break;
          default:
          // throw new Error(`unsupported program: ${opts.ix.programId}`);
        }
      },
      execEvent: async (opts: ExecEventFnOpts) => {
        console.log('execEvent');
        console.log(JSON.stringify(opts, null, 2));
        switch (opts.event.programId) {
          case programId:
            await processEvent(opts);
            break;
          default:
          // throw new Error(`unsupported program: ${opts.event.programId}`);
        }
      },
    });
  };
}
