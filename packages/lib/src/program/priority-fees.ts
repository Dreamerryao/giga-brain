import * as anchor from '@coral-xyz/anchor';
import orderBy from 'lodash.orderby';

const MAX_PRIORITY_FEE = 100_000;
const MIN_PRIORITY_FEE = 100;

export async function getPriorityFeeEstimateMicroLamports({
  connection,
  tx,
}: {
  connection: anchor.web3.Connection;
  tx?: anchor.web3.Transaction;
}): Promise<number> {
  try {
    if (tx) {
      // Extract all account keys from the transaction
      const accountKeys = tx.compileMessage().accountKeys;

      // Convert PublicKeys to base58 strings
      const publicKeys = accountKeys.map((key) => key.toBase58());

      const response = await fetch(connection.rpcEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'helius-example',
          method: 'getPriorityFeeEstimate',
          params: [
            {
              accountKeys: publicKeys,
              options: {
                recommended: true,
              },
            },
          ],
        }),
      });

      const data = await response.json();

      return data.result?.priorityFeeEstimate ?? 0;
    } else {
      const fees = orderBy(
        await connection.getRecentPrioritizationFees(),
        (fee) => fee.prioritizationFee,
        'desc'
      );
      let feeLamports = fees[0]?.prioritizationFee ?? 0;
      feeLamports = Math.max(
        MIN_PRIORITY_FEE,
        Math.min(MAX_PRIORITY_FEE, feeLamports)
      );
      console.log(
        JSON.stringify({
          message: 'Recent priority fee calculated',
          fee: feeLamports,
          minFee: MIN_PRIORITY_FEE,
          maxFee: MAX_PRIORITY_FEE,
        })
      );
      const feeMicroLamports = feeLamports * 1000;
      return feeMicroLamports;
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        error: (error as Error).message,
        message: 'Error in getPriorityFeeEstimateMicroLamports',
      })
    );
    throw error;
  }
}
