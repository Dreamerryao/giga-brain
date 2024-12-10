import * as anchor from '@coral-xyz/anchor';

export function serializeTx({
  tx,
  requireAllSignatures,
}: {
  tx: anchor.web3.Transaction;
  requireAllSignatures: boolean;
}) {
  return tx
    .serialize({
      requireAllSignatures,
    })
    .toString('base64');
}

export function deserializeTx(serializedTx: string) {
  return anchor.web3.Transaction.from(Buffer.from(serializedTx, 'base64'));
}
