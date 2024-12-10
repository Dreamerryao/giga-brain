import { IS_PROD } from '@/config';

export function getExplorerTxUrl(signature: string): string {
  return getExplorerUrl(`/tx/${signature}`);
}

export function getExplorerAddressUrl(account: string): string {
  return IS_PROD
    ? getExplorerUrl(`/account/${account}`)
    : getExplorerUrl(`/address/${account}`);
}

function getExplorerUrl(path: string) {
  return IS_PROD
    ? `https://solscan.io${path}`
    : `https://explorer.solana.com/${path}?cluster=devnet`;
}
