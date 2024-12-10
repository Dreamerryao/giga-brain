import { formatNumber, toBigNumber } from '@repo/lib/src/bn';
import { BigNumber } from 'bignumber.js';
import * as anchor from '@coral-xyz/anchor';
import { useMemo } from 'react';

import { GIGA_MINT, TOKENS_LIST } from '@/config';
import { useGameQuery } from '@/hooks/queries/useGameQuery';

export function FormatCurrency({
  amount,
  showValue,
  mint,
}: {
  amount: number | BigNumber | null;
  showValue?: boolean;
  mint: anchor.web3.PublicKey;
}) {
  const { data: game } = useGameQuery();

  const { symbol, decimals } = useMemo(() => {
    const [symbol, { decimals }] = TOKENS_LIST.find((t) =>
      t[1].mint.equals(mint)
    )!;
    return {
      symbol,
      decimals,
    };
  }, [mint]);

  const isGiga = useMemo(() => mint.equals(GIGA_MINT), [mint]);
  const price = useMemo(() => {
    return toBigNumber(isGiga ? game?.giga_price : game?.sol_price);
  }, [game, isGiga]);

  const humanizedAmount = useMemo(() => {
    return toBigNumber(amount || 0).div(10 ** decimals);
  }, [amount, decimals]);

  return (
    <>
      ${formatNumber(humanizedAmount.times(price))}
      {!showValue ? null : (
        <>
          {' '}
          <>
            ({formatNumber(humanizedAmount, isGiga ? 2 : 4)} {symbol})
          </>
        </>
      )}
    </>
  );
}
