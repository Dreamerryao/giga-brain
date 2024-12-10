import { eq } from 'drizzle-orm';
import { NATIVE_MINT } from '@solana/spl-token';
import { toBigNumber } from '@repo/lib/src/bn';
import BigNumber from 'bignumber.js';
import * as anchor from '@coral-xyz/anchor';

import { game, playerActivity, playerCurrencyStats, puzzle } from '@/db/schema';
import { GbProgram } from '@/lib/program/program';
import { db as drizzleDb } from '@/db';
import { GIGA_MINT } from '@/scripts/test/lib/config';

export class UsdUpdater {
  gbProgram: GbProgram;
  gigaPrice: BigNumber;
  solPrice: BigNumber;
  gigaDecimals: number;
  solDecimals: number;

  static async new(gbProgram: GbProgram) {
    return new UsdUpdater(gbProgram);
  }

  constructor(gbProgram: GbProgram) {
    this.gbProgram = gbProgram;
    this.gigaPrice = toBigNumber(0);
    this.solPrice = toBigNumber(0);
    this.gigaDecimals = 6;
    this.solDecimals = 9;
  }

  async run() {
    const [gameRecord] = await drizzleDb.select().from(game).limit(1);

    this.gigaPrice = toBigNumber(gameRecord.gigaPrice);
    this.solPrice = toBigNumber(gameRecord.solPrice);

    await this.updateGameFundsUsd();
    await this.updatePuzzleFundsUsd();
    await this.updatePlayerEarningsUsd();
  }

  async updateGameFundsUsd() {
    console.log('update game funds usd');
    const [gameGigaCurrency, gameSolCurrency] = await Promise.all([
      this.gbProgram.getPuzzleCurrencyRecordByMint(GIGA_MINT),
      this.gbProgram.getPuzzleCurrencyRecordByMint(NATIVE_MINT),
    ]);

    // const gigaTotalPuzzlesSolvedUsd = toBigNumber(
    //   gameGigaCurrency.totalPuzzlesSolvedValue
    // ).times(this.gigaPrice);
    // const solTotalPuzzlesSolvedUsd = toBigNumber(
    //   gameSolCurrency.totalPuzzlesSolvedValue
    // ).times(this.solPrice);

    // const gigaTotalPuzzlesTimedOutUsd = toBigNumber(
    //   gameGigaCurrency.totalPuzzlesTimedOutValue
    // ).times(this.gigaPrice);
    // const solTotalPuzzlesTimedOutUsd = toBigNumber(
    //   gameSolCurrency.totalPuzzlesTimedOutValue
    // ).times(this.solPrice);

    const gigaTotalFeesPaidUsd = toBigNumber(gameGigaCurrency.totalFeesPaid)
      .times(this.gigaPrice)
      .div(10 ** this.gigaDecimals);
    const solTotalFeesPaidUsd = toBigNumber(gameSolCurrency.totalFeesPaid)
      .times(this.solPrice)
      .div(10 ** this.solDecimals);

    const gigaTotalPrizesEscrowedUsd = toBigNumber(
      gameGigaCurrency.totalPrizesEscrowed
    )
      .times(this.gigaPrice)
      .div(10 ** this.gigaDecimals);
    const solTotalPrizesEscrowedUsd = toBigNumber(
      gameSolCurrency.totalPrizesEscrowed
    )
      .times(this.solPrice)
      .div(10 ** this.solDecimals);

    // const totalPuzzlesSolvedUsd = gigaTotalPuzzlesSolvedUsd.plus(
    //   solTotalPuzzlesSolvedUsd
    // );
    // const totalTimedOutUsd = gigaTotalPuzzlesTimedOutUsd.plus(
    //   solTotalPuzzlesTimedOutUsd
    // );

    const totalFeesPaidUsd = gigaTotalFeesPaidUsd.plus(solTotalFeesPaidUsd);
    const totalPrizesEscrowedUsd = gigaTotalPrizesEscrowedUsd.plus(
      solTotalPrizesEscrowedUsd
    );

    // const gameGigaEarnings = await drizzleDb.update(game).set({
    //   totalEarningsUsd,
    // });

    const totalActivePuzzlesFundsUsd =
      totalPrizesEscrowedUsd.plus(totalFeesPaidUsd);

    await drizzleDb.update(game).set({
      totalActivePuzzlesFundsUsd: totalActivePuzzlesFundsUsd.toString(),
    });
  }

  async updatePuzzleFundsUsd() {
    console.log('update puzzle funds usd');

    const numPuzzleRecords = await drizzleDb.$count(puzzle);
    const batches = Math.ceil(numPuzzleRecords / 100);
    for (let i = 0; i < batches; i++) {
      const puzzleRecords = await drizzleDb
        .select()
        .from(puzzle)
        .limit(100)
        .offset(i * 100);
      for (const puzzleRecord of puzzleRecords) {
        const mint = new anchor.web3.PublicKey(puzzleRecord.currencyMint);
        const price = mint.equals(GIGA_MINT) ? this.gigaPrice : this.solPrice;
        const decimals = mint.equals(GIGA_MINT)
          ? this.gigaDecimals
          : this.solDecimals;
        const totalFundsUsd = toBigNumber(puzzleRecord.initialPrize)
          .plus(toBigNumber(puzzleRecord.totalFeesPaid))
          .times(price)
          .div(10 ** decimals);
        await drizzleDb
          .update(puzzle)
          .set({
            totalFundsUsd: totalFundsUsd.toString(),
          })
          .where(eq(puzzle.publicKey, puzzleRecord.publicKey));
      }
    }
  }

  async updatePlayerEarningsUsd() {
    console.log('update player earnings usd');
    const numPlayerActivityRecords = await drizzleDb.$count(playerActivity);
    const batches = Math.ceil(numPlayerActivityRecords / 100);
    for (let i = 0; i < batches; i++) {
      const playerActivityRecords = await drizzleDb
        .select()
        .from(playerActivity)
        .limit(100)
        .offset(i * 100);
      for (const playerActivityRecord of playerActivityRecords) {
        const playerCurrencyStatsRecords = await drizzleDb
          .select()
          .from(playerCurrencyStats)
          .where(
            eq(playerCurrencyStats.player, playerActivityRecord.publicKey)
          );
        const totalFeesPaidUsd = playerCurrencyStatsRecords.reduce(
          (acc, record) => {
            const mint = new anchor.web3.PublicKey(record.mint);
            const decimals = mint.equals(GIGA_MINT)
              ? this.gigaDecimals
              : this.solDecimals;
            const price = mint.equals(GIGA_MINT)
              ? this.gigaPrice
              : this.solPrice;
            return acc
              .plus(toBigNumber(record.totalFeesPaid).times(price))
              .div(10 ** decimals);
          },
          toBigNumber(0)
        );
        const totalEarningsUsd = playerCurrencyStatsRecords.reduce(
          (acc, record) => {
            const mint = new anchor.web3.PublicKey(record.mint);
            const decimals = mint.equals(GIGA_MINT)
              ? this.gigaDecimals
              : this.solDecimals;
            const price = mint.equals(GIGA_MINT)
              ? this.gigaPrice
              : this.solPrice;
            const earnings =
              record.totalPuzzlesSolvedValue + record.totalPuzzlesTimedOutValue;
            return acc
              .plus(toBigNumber(earnings).times(price))
              .div(10 ** decimals);
          },
          toBigNumber(0)
        );
        await drizzleDb
          .update(playerActivity)
          .set({
            totalEarningsUsd: totalEarningsUsd.toString(),
            totalFeesPaidUsd: totalFeesPaidUsd.toString(),
          })
          .where(eq(playerActivity.publicKey, playerActivityRecord.publicKey));
      }
    }
  }
}
