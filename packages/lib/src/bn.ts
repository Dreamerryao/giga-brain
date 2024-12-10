import * as anchor from '@coral-xyz/anchor';
import BigNumber from 'bignumber.js';

export const toBigNumber = (n: any) => new BigNumber(n);

export const formatNumber = (
  m: BigNumber | number | string,
  decimals: number = 2
) => {
  const c = toBigNumber(m);
  return c.isNaN() ? '0' : c.toFormat(decimals);
};

export function toLamports(amount: number, decimals: number) {
  return new anchor.BN(amount * 10 ** decimals);
}

export function fromLamports(
  amount: anchor.BN | string | number,
  decimals: number
) {
  return toBigNumber(amount)
    .div(toBigNumber(10 ** decimals))
    .toNumber();
}

export function toLamportsBN(
  amount: BigNumber | string | number,
  decimals: number
) {
  return toBigNumber(amount).times(10 ** decimals);
}

export function fromLamportsBN(
  amount: anchor.BN | string | number | BigNumber,
  decimals: number
) {
  return toBigNumber(amount)
    .div(toBigNumber(10 ** decimals))
    .toNumber();
}
