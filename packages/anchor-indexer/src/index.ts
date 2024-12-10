import * as anchor from '@coral-xyz/anchor';

import {
  ExecEventFn,
  ExecParsedIxFn,
  ExecPartiallyDecodedIxFn,
  Db,
  TxnsTable,
} from './types';
import { InsertNewSignatures } from './insert-new-signatures';
import { PopulateTransactions } from './populate-transactions';
import { ProcessTransactions } from './parse-transactions';
import { noopLogger } from './utils';

export * from './types';
export { createTxnsTableSchema } from './db';

export async function indexAccount({
  provider,
  pubKey,
  programs,
  execParsedIx,
  execPartiallyDecodedIx,
  execEvent,
  txnsTable,
  db,
  debug,
}: {
  provider: anchor.Provider;
  pubKey: anchor.web3.PublicKey;
  programs: Map<string, anchor.Idl>;
  execParsedIx: ExecParsedIxFn;
  execPartiallyDecodedIx: ExecPartiallyDecodedIxFn;
  execEvent: ExecEventFn;
  db: Db;
  txnsTable: TxnsTable;
  debug?: boolean;
}) {
  const logger = !debug ? noopLogger : console;

  const insertNewSignatures = new InsertNewSignatures({
    pubKey,
    provider,
    db,
    txnsTable,
    logger,
  });
  await insertNewSignatures.exec();

  const populateTransactions = new PopulateTransactions({
    pubKey,
    provider,
    db,
    txnsTable,
    logger,
  });
  await populateTransactions.exec();

  const processTransactions = new ProcessTransactions({
    pubKey,
    programs,
    execParsedIx,
    execPartiallyDecodedIx,
    execEvent,
    provider,
    db,
    txnsTable,
    logger,
  });
  await processTransactions.exec();
}
