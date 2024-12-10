import BigNumber from 'bignumber.js';
import { toBigNumber } from '@repo/lib/src/bn';
import { eq } from 'drizzle-orm';

import { db as drizzleDb } from '@/db';
import { game, tokenTrades } from '@/db/schema';

export interface ITrade {
  block_number: number;
  tx_hash: string;
  tx_from_address: string;
  from_token_amount: string;
  to_token_amount: string;
  price_from_in_currency_token: string;
  price_to_in_currency_token: string;
  price_from_in_usd: string;
  price_to_in_usd: string;
  block_timestamp: string;
  kind: 'buy' | 'sell';
  volume_in_usd: string;
  from_token_address: string;
  to_token_address: string;
}

export class Coingecko {
  private announceTrade: (trade: ITrade) => Promise<void>;

  constructor(announceTrade: (trade: ITrade) => Promise<void>) {
    this.announceTrade = announceTrade;
  }

  static async new(announceTrade: (trade: ITrade) => Promise<void>) {
    return new Coingecko(announceTrade);
  }

  async run() {
    try {
      const [
        solPrice,
        {
          gigaPrice,
          gigaMarketCap,
          gigaVolume24h,
          // pools,
          gigaCirculatingSupply,
        },
      ] = await Promise.all([this.getSolPrize(), this.getTokenInfo()]);
      console.log('updating', {
        solPrice,
        gigaPrice,
        gigaMarketCap,
        gigaVolume24h,
        gigaCirculatingSupply,
      });
      await drizzleDb.update(game).set({
        solPrice,
        gigaPrice,
        gigaMarketCap,
        gigaVolume24h,
        gigaCirculatingSupply,
      });
      // await this.updateTokenTrades(pools);
    } catch (err) {
      console.error(err);
    }
  }

  async getSolPrize() {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
    );
    const {
      solana: { usd },
    }: { solana: { usd: string } } = await res.json();

    return usd;
  }
  async getTokenInfo() {
    const res = await fetch(
      'https://api.geckoterminal.com/api/v2/networks/solana/tokens/GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump'
    );
    const {
      data,
    }: {
      data: {
        id: string;
        type: string;
        attributes: {
          address: string;
          name: string;
          symbol: string;
          decimals: number;
          image_url: string;
          coingecko_coin_id: null | string;
          total_supply: string;
          price_usd: string;
          fdv_usd: string;
          total_reserve_in_usd: string;
          volume_usd: {
            h24: string;
          };
          market_cap_usd: null | string;
        };
        relationships: {
          top_pools: {
            data: {
              id: string;
              type: string;
            }[];
          };
        };
      };
    } = await res.json();
    const supply = toBigNumber(data.attributes.total_supply).div(1e6);
    return {
      gigaPrice: toDrizzleDecimal(data.attributes.price_usd),
      gigaMarketCap: toDrizzleDecimal(
        data.attributes.market_cap_usd ||
          supply.times(toBigNumber(data.attributes.price_usd))
      ),
      gigaVolume24h: toDrizzleDecimal(data.attributes.volume_usd.h24),
      gigaCirculatingSupply: toDrizzleDecimal(supply),
      pools: data.relationships.top_pools.data.map((pool) => pool.id),
    };
  }

  async updateTokenTrades(pools: string[]) {
    for (const pool of pools) {
      const res = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pool.replace(
          'solana_',
          ''
        )}/trades`
      );

      const {
        data,
      }: {
        data: {
          id: string;
          type: string;
          attributes: ITrade;
        }[];
      } = await res.json();

      for (const trade of data) {
        const existingTrades = await drizzleDb
          .select()
          .from(tokenTrades)
          .where(eq(tokenTrades.txHash, trade.attributes.tx_hash));

        if (!existingTrades.length) {
          if (
            trade.attributes.kind.toLowerCase() === 'buy' &&
            toBigNumber(trade.attributes.volume_in_usd).gt(500)
          ) {
            await this.announceTrade(trade.attributes);
          }

          await drizzleDb
            .insert(tokenTrades)
            .values({
              txHash: trade.attributes.tx_hash,
              txFromAddress: trade.attributes.tx_from_address,
              fromTokenAmount: trade.attributes.from_token_amount,
              toTokenAmount: trade.attributes.to_token_amount,
              priceFromInCurrencyToken:
                trade.attributes.price_from_in_currency_token,
              priceToInCurrencyToken:
                trade.attributes.price_to_in_currency_token,
              priceFromInUsd: trade.attributes.price_from_in_usd,
              priceToInUsd: trade.attributes.price_to_in_usd,
              kind: trade.attributes.kind,
              volumeInUsd: trade.attributes.volume_in_usd,
              fromTokenAddress: trade.attributes.from_token_address,
              toTokenAddress: trade.attributes.to_token_address,
            })
            .onConflictDoNothing();
        }
      }
    }
  }
}

function toDrizzleDecimal(value: string | BigNumber) {
  return toBigNumber(value).decimalPlaces(8).toFormat({
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 0,
  });
}
