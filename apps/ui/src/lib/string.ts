export function abbrAddr(base58 = '', size = 4) {
  return base58.slice(0, size) + '…' + base58.slice(-size);
}
