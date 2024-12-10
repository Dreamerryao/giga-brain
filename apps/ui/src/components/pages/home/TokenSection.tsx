import React from 'react';
import { Brain, ExternalLink } from 'lucide-react';

interface DexLink {
  name: string;
  url: string;
  icon: string;
}

const dexLinks: DexLink[] = [
  {
    name: 'CoinMarketCap',
    url: 'https://coinmarketcap.com/dexscan/solana/GmNQzmfZbmf8uMWF5xRQppULpdvayTLaguhNVyFNAWnP/',
    icon: '/dexes/cmc.svg',
  },
  {
    name: 'CoinGecko',
    url: 'https://www.coingecko.com/en/coins/gigabrain',
    icon: '/dexes/coingecko.svg',
  },
  {
    name: 'DexTools',
    url: 'https://www.dextools.io/app/en/solana/pair-explorer/GmNQzmfZbmf8uMWF5xRQppULpdvayTLaguhNVyFNAWnP?t=1735139614133',
    icon: '/dexes/dextools.webp',
  },
  {
    name: 'GeckoTerminal',
    url: 'https://www.geckoterminal.com/solana/tokens/GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump',
    icon: '/dexes/geckoterminal.webp',
  },
  {
    name: 'BubbleMaps',
    url: 'https://app.bubblemaps.io/sol/token/GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump',
    icon: '/dexes/bubblemaps.webp',
  },
  {
    name: 'Birdeye',
    url: 'https://www.birdeye.so/token/GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump?chain=solana',
    icon: '/dexes/birdeye.webp',
  },
  {
    name: 'RugCheck',
    url: 'https://rugcheck.xyz/tokens/GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump',
    icon: '/dexes/rugcheck.webp',
  },
  {
    name: 'DexScreener',
    url: 'https://dexscreener.com/solana/GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump',
    icon: '/dexes/dexscreener.webp',
  },
];

export function TokenSection() {
  return (
    <div className='space-y-8'>
      <div className='text-center space-y-2'>
        <div className='inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full'>
          <Brain className='w-5 h-5' />
          <span className='text-sm font-medium'>GIGA🧠 Token</span>
        </div>
        <h2 className='text-3xl font-bold'>Listed on Major DEXes</h2>
        <p className='text-zinc-400'>
          Track and trade GIGA🧠 on your preferred platform
        </p>
      </div>

      <div className='game-card p-6 lg:px-32'>
        <div className='flex flex-wrap items-center justify-center gap-4'>
          {dexLinks.map((dex) => (
            <a
              key={dex.name}
              href={dex.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center space-x-2 px-4 py-2 bg-zinc-800/50 rounded-xl 
                       hover:bg-rose-500/10 border border-zinc-700/50 hover:border-rose-500/20 
                       transition-all duration-300 group'
            >
              <img
                src={dex.icon}
                alt={dex.name}
                className='w-8 h-8 rounded-lg'
              />
              <span className='text-zinc-400 group-hover:text-rose-400'>
                {dex.name}
              </span>
              <ExternalLink className='w-4 h-4 text-zinc-500 group-hover:text-rose-400' />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
