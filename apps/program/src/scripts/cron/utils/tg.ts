import { Telegraf, Context } from 'telegraf';
import { formatNumber } from '@repo/lib/src/bn';

import { GbProgram } from '@/lib/program/program';

import { ITrade } from './coingecko';

const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const TOKEN_ADDRESS = 'GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump';
const TOKEN_SYMBOL = 'GIGA🧠';
const CHAIN = 'solana';
const CHAIN_NATIVE_TOKEN = 'SOL';
const EXPLORER_URL = 'https://solscan.io';
const WEBSITE_URL = 'https://wwww.gigabrain.so';
const TWITTER_URL = 'https://x.com/GigaBrainDotSo';
const TELEGRAM_GROUP = 'https://t.me/GigaBrainDotSo';
const DISCORD_URL = 'https://discord.gg/zxtMWFJSNf';
const DEX_URL =
  'https://dexscreener.com/solana/GHpAbHZ8MCAXWLdKzxM1ZGhP2U4u1ni5vUcoRSghpump';
const CHAT_ID = process.env.TG_CHAT_ID!;

interface TokenInfo {
  price: string;
  marketCap: string;
  volume24h: string;
}

export class CryptoBot {
  private bot: Telegraf;
  private tokenAddress: string;
  private tokenSymbol: string;
  private gbProgram: GbProgram;

  constructor(gbProgram: GbProgram) {
    this.gbProgram = gbProgram;
    this.bot = new Telegraf(BOT_TOKEN || '');
    this.tokenAddress = TOKEN_ADDRESS || '';
    this.tokenSymbol = TOKEN_SYMBOL || '';

    this.setupCommands();
  }

  private setupCommands(): void {
    // Basic commands
    this.bot.command('start', this.handleStart.bind(this));
    this.bot.command('help', this.handleHelp.bind(this));

    // Price and market commands
    this.bot.command('price', this.handlePrice.bind(this));
    this.bot.command('marketcap', this.handleMarketCap.bind(this));
    this.bot.command('volume', this.handleVolume.bind(this));
    this.bot.command('chart', this.handleChart.bind(this));

    // Project info commands
    this.bot.command('ca', this.handleContract.bind(this));
    this.bot.command('address', this.handleContract.bind(this));
    this.bot.command('contract', this.handleContract.bind(this));
    this.bot.command('website', this.handleWebsite.bind(this));
    this.bot.command('socials', this.handleSocials.bind(this));

    // Utility commands
    this.bot.command('buy', this.handleBuy.bind(this));
    // this.bot.command('whitepaper', this.handleWhitepaper.bind(this));
    // this.bot.command('roadmap', this.handleRoadmap.bind(this));
  }

  private async handleStart(ctx: Context): Promise<void> {
    const message = `Welcome to ${this.tokenSymbol} Bot! 🚀\n\nUse /help to see available commands.`;
    await ctx.reply(message);
  }

  private async handleHelp(ctx: Context): Promise<void> {
    //  /whitepaper - Project whitepaper
    // /roadmap - Project roadmap
    //

    const helpMessage = `
Available commands:

📊 Price & Markets
/price - Current token price
/marketcap - Market capitalization
/volume - 24h trading volume
/chart - Price chart link

ℹ️ Project Info
/ca - Contract address
/website - Official website
/socials - Social media links

🔷 Trading
/buy - How to buy guide

Need more help? Join our community!`;

    await ctx.reply(helpMessage);
  }

  private async handlePrice(ctx: Context): Promise<void> {
    try {
      const tokenInfo = await this.getTokenInfo();
      await ctx.reply(
        `Current ${this.tokenSymbol} price: $${formatNumber(tokenInfo.price, 8)}`
      );
    } catch (error) {
      console.error(error);
      await ctx.reply('Error fetching price. Please try again later.');
    }
  }

  private async handleMarketCap(ctx: Context): Promise<void> {
    try {
      const tokenInfo = await this.getTokenInfo();
      const formattedMcap = formatNumber(tokenInfo.marketCap);
      await ctx.reply(`${this.tokenSymbol} Market Cap: ${formattedMcap}`);
    } catch (error) {
      console.error(error);
      await ctx.reply('Error fetching market cap. Please try again later.');
    }
  }

  private async handleVolume(ctx: Context): Promise<void> {
    try {
      const tokenInfo = await this.getTokenInfo();
      const formattedVolume = formatNumber(tokenInfo.volume24h);
      await ctx.reply(`24h Trading Volume: ${formattedVolume}`);
    } catch (error) {
      console.error(error);
      await ctx.reply('Error fetching volume. Please try again later.');
    }
  }

  private async handleChart(ctx: Context): Promise<void> {
    const chartUrl = `https://dexscreener.com/${CHAIN}/${this.tokenAddress}`;
    await ctx.reply(`📈 Chart: ${chartUrl}`);
  }

  private async handleContract(ctx: Context): Promise<void> {
    const explorerUrl = `${EXPLORER_URL}/address/${this.tokenAddress}`;
    await ctx.reply(
      `Contract Address: \`${this.tokenAddress}\`\n\nView on Explorer: ${explorerUrl}`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleWebsite(ctx: Context): Promise<void> {
    await ctx.reply(`🌐 Official Website: ${WEBSITE_URL}`);
  }

  private async handleSocials(ctx: Context): Promise<void> {
    const socialsMessage = `
📱 Official Social Media Links:

Twitter: ${TWITTER_URL}
Telegram Group: ${TELEGRAM_GROUP}
Discord: ${DISCORD_URL}`;

    await ctx.reply(socialsMessage);
  }

  private async handleBuy(ctx: Context): Promise<void> {
    const buyMessage = `
How to buy ${this.tokenSymbol}:

1. Get ${CHAIN_NATIVE_TOKEN} in your wallet
2. Visit our supported DEX: ${DEX_URL}
3. Connect your wallet
4. Swap ${CHAIN_NATIVE_TOKEN} for ${this.tokenSymbol}

Contract Address: \`${this.tokenAddress}\`

Need help? Join our Telegram group!`;

    await ctx.reply(buyMessage, { parse_mode: 'Markdown' });
  }

  // private async handleWhitepaper(ctx: Context): Promise<void> {
  //   await ctx.reply(`📄 Whitepaper: ${WHITEPAPER_URL}`);
  // }

  // private async handleRoadmap(ctx: Context): Promise<void> {
  //   await ctx.reply(`🗺 Project Roadmap: ${ROADMAP_URL}`);
  // }

  private async getTokenInfo(): Promise<TokenInfo> {
    const game = await this.gbProgram.getGameRecord();
    return {
      price: game.gigaPrice,
      marketCap: game.gigaMarketCap,
      volume24h: game.gigaVolume24h,
    };
  }

  public async announceTrade(trade: ITrade) {
    const game = await this.gbProgram.getGameRecord();
    const emoji = trade.kind.toLowerCase() === 'buy' ? '🟢 BUY' : '🔴 SELL';
    const timestamp = new Date(trade.block_timestamp).toLocaleString();

    const message = `
${emoji} *New Trade*

💰 Amount: ${formatNumber(trade.from_token_amount)} SOL
💵 Value: ${formatNumber(trade.volume_in_usd)}
💱 Tokens: ${formatNumber(trade.to_token_amount)}
🏷️ Price: ${formatNumber(trade.price_to_in_usd, 8)}
📈 MCap: ${formatNumber(game.gigaMarketCap)}

👤 Trader: \`${abbrAddr(trade.tx_from_address)}\`
🔗 [View Transaction](https://solscan.io/tx/${trade.tx_hash})

⏰ ${timestamp}`;

    console.log(message);

    await this.sendToGroup(message);
  }

  // private async handleBroadcast(ctx: Context): Promise<void> {
  //   const userId = ctx.from?.id.toString();

  //   if (!userId || !this.isAdmin(userId)) {
  //     await ctx.reply('You are not authorized to use this command.');
  //     return;
  //   }

  //   const message = ctx.message.text.split('/broadcast ')[1];

  //   if (!message) {
  //     await ctx.reply(
  //       'Please provide a message to broadcast.\nFormat: /broadcast Your message here'
  //     );
  //     return;
  //   }

  //   try {
  //     await this.bot.telegram.sendMessage(CHAT_ID, message, {
  //       parse_mode: 'Markdown',
  //     });
  //     await ctx.reply('Message broadcasted successfully! ✅');
  //   } catch (error) {
  //     console.error('Broadcast error:', error);
  //     await ctx.reply(
  //       'Failed to broadcast message. Please check bot permissions and try again.'
  //     );
  //   }
  // }

  public async sendToGroup(message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(CHAT_ID, message, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Failed to send message to group:', error);
      throw error;
    }
  }

  public start(): void {
    if (!BOT_TOKEN) {
      console.log('BOT_TOKEN is not set');
      return;
    }

    this.bot
      .launch()
      .then(() => {
        console.log('Bot is running!');
      })
      .catch((err) => {
        console.error('Failed to start bot:', err);
      });

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}

function abbrAddr(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
