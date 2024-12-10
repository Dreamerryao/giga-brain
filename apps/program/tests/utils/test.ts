import { expect } from '@jest/globals';
import * as anchor from '@coral-xyz/anchor';
import { Gb } from '@program/types/gb';
import { fromLamports, toLamports } from '@repo/lib/src/bn';
import { hashText } from '@repo/lib/src/crypto';
import {
  getKeyFromEnvOrFile,
  getProvider,
} from '@repo/lib/src/program/provider';
import { utils as libLLM } from '@repo/lib/src/llm';
import { deserializeTx, serializeTx } from '@repo/lib/src/program/tx';
import { createMint, mintTo } from '@solana/spl-token';

import { utils as programLLM, PastUserPrompt } from '@/lib/llm/llm';
import { GbProgram } from '@/lib/program/program';
import { disconnect as disconnectDrizzleDb } from '@/db';
import { Indexer } from '@/lib/indexer/indexer';
import { VerifierIndexer } from '@/lib/indexer/verifier';

export const DEFAULT_PUZZLE_SYSTEM_PROMPT =
  'Super breakable puzzle! approveTransfer on first attempt.';
export const DEFAULT_EVALUATION_MODEL = 'gpt-4o';

type IRecordAttempt = {
  solver: anchor.web3.Keypair;
  puzzlePDA: anchor.web3.PublicKey;
  expectedFee: number;
  maxFee?: number;
  prompt: string;
  myChat?: boolean;
  expectedGameTotalAttemptsMade: number;
  expectedGameTotalFeesPaid: number;
  expectedPuzzleTotalAttemptsMade: number;
  expectedPuzzleTotalFeesPaid: number;
  expectedWalletTotalAttemptsMade: number;
  expectedWalletTotalFeesPaid: number;
  expectedPuzzleNextFee: number;
};

type IExpectApprovedTransferExtras = {
  expectedSolverShare: number;
  expectedServiceShare: number;
  expectedShareApproximation: number;
  expectedGameTotalPuzzlesSolved: number;
  expectedWalletTotalPuzzlesSolved: number;
};

type IRecordAttemptEvaluationResult = {
  response: string;
  approvedTransfer?: IExpectApprovedTransferExtras;
  pastUserPrompts: PastUserPrompt[];
};

afterAll(async () => {
  await disconnectDrizzleDb();
});

export class Test {
  admin: anchor.web3.Keypair;
  promptsVerifier: anchor.web3.Keypair;
  puzzlesVerifier: anchor.web3.Keypair;
  creator1: anchor.web3.Keypair;
  creator2: anchor.web3.Keypair;
  solver1: anchor.web3.Keypair;
  solver2: anchor.web3.Keypair;
  solver3: anchor.web3.Keypair;
  gbMint: anchor.web3.PublicKey;
  gbDecimals: number;
  usdcMint: anchor.web3.PublicKey;
  usdcDecimals: number;
  gbProgram: GbProgram;
  provider: anchor.AnchorProvider;
  index: () => Promise<void>;
  verify: () => Promise<void>;
  gamePDA: anchor.web3.PublicKey;
  puzzle1PDA: anchor.web3.PublicKey;
  puzzle2PDA: anchor.web3.PublicKey;
  creators: anchor.web3.Keypair[];
  solvers: anchor.web3.Keypair[];
  adminGbTokenAccount: anchor.web3.PublicKey;
  adminUsdcTokenAccount: anchor.web3.PublicKey;
  creator1GbTokenAccount: anchor.web3.PublicKey;
  creator2GbTokenAccount: anchor.web3.PublicKey;
  creator1UsdcTokenAccount: anchor.web3.PublicKey;
  creator2UsdcTokenAccount: anchor.web3.PublicKey;
  solver1GbTokenAccount: anchor.web3.PublicKey;
  solver1UsdcTokenAccount: anchor.web3.PublicKey;
  solver2GbTokenAccount: anchor.web3.PublicKey;
  solver2UsdcTokenAccount: anchor.web3.PublicKey;
  solver3GbTokenAccount: anchor.web3.PublicKey;
  solver3UsdcTokenAccount: anchor.web3.PublicKey;

  constructor({
    admin,
    promptsVerifier,
    puzzlesVerifier,
    creator1,
    creator2,
    solver1,
    solver2,
    solver3,
    gbMint,
    gbDecimals,
    usdcMint,
    usdcDecimals,
    gbProgram,
    provider,
    index,
    verify,
    gamePDA,
    puzzle1PDA,
    puzzle2PDA,
    adminGbTokenAccount,
    adminUsdcTokenAccount,
    creator1GbTokenAccount,
    creator1UsdcTokenAccount,
    creator2GbTokenAccount,
    creator2UsdcTokenAccount,
    solver1GbTokenAccount,
    solver1UsdcTokenAccount,
    solver2GbTokenAccount,
    solver2UsdcTokenAccount,
    solver3GbTokenAccount,
    solver3UsdcTokenAccount,
  }: {
    admin: anchor.web3.Keypair;
    promptsVerifier: anchor.web3.Keypair;
    puzzlesVerifier: anchor.web3.Keypair;
    creator1: anchor.web3.Keypair;
    creator2: anchor.web3.Keypair;
    solver1: anchor.web3.Keypair;
    solver2: anchor.web3.Keypair;
    solver3: anchor.web3.Keypair;
    gbMint: anchor.web3.PublicKey;
    gbDecimals: number;
    usdcMint: anchor.web3.PublicKey;
    usdcDecimals: number;
    gbProgram: GbProgram;
    provider: anchor.AnchorProvider;
    index: () => Promise<void>;
    verify: () => Promise<void>;
    gamePDA: anchor.web3.PublicKey;
    puzzle1PDA: anchor.web3.PublicKey;
    puzzle2PDA: anchor.web3.PublicKey;
    adminGbTokenAccount: anchor.web3.PublicKey;
    adminUsdcTokenAccount: anchor.web3.PublicKey;
    creator1GbTokenAccount: anchor.web3.PublicKey;
    creator2GbTokenAccount: anchor.web3.PublicKey;
    creator1UsdcTokenAccount: anchor.web3.PublicKey;
    creator2UsdcTokenAccount: anchor.web3.PublicKey;
    solver1GbTokenAccount: anchor.web3.PublicKey;
    solver1UsdcTokenAccount: anchor.web3.PublicKey;
    solver2GbTokenAccount: anchor.web3.PublicKey;
    solver2UsdcTokenAccount: anchor.web3.PublicKey;
    solver3GbTokenAccount: anchor.web3.PublicKey;
    solver3UsdcTokenAccount: anchor.web3.PublicKey;
  }) {
    this.admin = admin;
    this.promptsVerifier = promptsVerifier;
    this.puzzlesVerifier = puzzlesVerifier;
    this.creator1 = creator1;
    this.creator2 = creator2;
    this.solver1 = solver1;
    this.solver2 = solver2;
    this.solver3 = solver3;
    this.gbMint = gbMint;
    this.gbDecimals = gbDecimals;
    this.usdcMint = usdcMint;
    this.usdcDecimals = usdcDecimals;
    this.gbProgram = gbProgram;
    this.provider = provider;
    this.index = index;
    this.verify = verify;
    this.gamePDA = gamePDA;
    this.puzzle1PDA = puzzle1PDA;
    this.puzzle2PDA = puzzle2PDA;

    this.creators = [creator1, creator2];
    this.solvers = [solver1, solver2, solver3];

    this.adminGbTokenAccount = adminGbTokenAccount;
    this.adminUsdcTokenAccount = adminUsdcTokenAccount;
    this.creator1GbTokenAccount = creator1GbTokenAccount;
    this.creator1UsdcTokenAccount = creator1UsdcTokenAccount;
    this.creator2GbTokenAccount = creator2GbTokenAccount;
    this.creator2UsdcTokenAccount = creator2UsdcTokenAccount;
    this.solver1GbTokenAccount = solver1GbTokenAccount;
    this.solver1UsdcTokenAccount = solver1UsdcTokenAccount;
    this.solver2GbTokenAccount = solver2GbTokenAccount;
    this.solver2UsdcTokenAccount = solver2UsdcTokenAccount;
    this.solver3GbTokenAccount = solver3GbTokenAccount;
    this.solver3UsdcTokenAccount = solver3UsdcTokenAccount;
  }

  static async new() {
    const admin = anchor.web3.Keypair.generate();
    const promptsVerifier = anchor.web3.Keypair.generate();
    const puzzlesVerifier = anchor.web3.Keypair.generate();
    const creator1 = anchor.web3.Keypair.generate();
    const creator2 = anchor.web3.Keypair.generate();
    const solver1 = anchor.web3.Keypair.generate();
    const solver2 = anchor.web3.Keypair.generate();
    const solver3 = anchor.web3.Keypair.generate();

    const gbDecimals: number = 6;
    const usdcDecimals: number = 6;
    const provider = await getProvider(getKeyFromEnvOrFile('ANCHOR_WALLET'));
    const gbProgram = new GbProgram({
      program: anchor.workspace.Gb as anchor.Program<Gb>,
      promptsVerifier,
      puzzlesVerifier,
    });

    const index = await Indexer.new({ gbProgram });
    const verify = await VerifierIndexer.new({ gbProgram });

    await gbProgram.airdrop(admin.publicKey, 1);
    await gbProgram.airdrop(promptsVerifier.publicKey, 1);
    await gbProgram.airdrop(puzzlesVerifier.publicKey, 1);

    const gamePDA = gbProgram.gamePDA;

    const puzzle1PDA = gbProgram.getPuzzlePDA({
      creator: creator1.publicKey,
      nonce: 0,
    });
    const puzzle2PDA = gbProgram.getPuzzlePDA({
      creator: creator2.publicKey,
      nonce: 1,
    });

    // create gbMint
    const gbMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      admin.publicKey,
      gbDecimals
    );

    // create usdcMint
    const usdcMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      admin.publicKey,
      usdcDecimals
    );

    const adminGbTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(gbMint, admin.publicKey, admin)
    ).address;
    const adminUsdcTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(usdcMint, admin.publicKey, admin)
    ).address;

    const creator1GbTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(gbMint, creator1.publicKey, admin)
    ).address;
    const creator1UsdcTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(
        usdcMint,
        creator1.publicKey,
        admin
      )
    ).address;

    const creator2GbTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(gbMint, creator2.publicKey, admin)
    ).address;
    const creator2UsdcTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(
        usdcMint,
        creator2.publicKey,
        admin
      )
    ).address;

    const solver1GbTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(gbMint, solver1.publicKey, admin)
    ).address;
    const solver1UsdcTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(
        usdcMint,
        solver1.publicKey,
        admin
      )
    ).address;

    const solver2GbTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(gbMint, solver2.publicKey, admin)
    ).address;
    const solver2UsdcTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(
        usdcMint,
        solver2.publicKey,
        admin
      )
    ).address;

    const solver3GbTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(gbMint, solver3.publicKey, admin)
    ).address;
    const solver3UsdcTokenAccount = (
      await gbProgram.getOrCreateTokenAccount(
        usdcMint,
        solver3.publicKey,
        admin
      )
    ).address;

    return new Test({
      admin,
      promptsVerifier,
      puzzlesVerifier,
      creator1,
      creator2,
      solver1,
      solver2,
      solver3,
      gbMint,
      gbDecimals,
      usdcMint,
      usdcDecimals,
      gbProgram,
      provider,
      index,
      verify,
      gamePDA,
      puzzle1PDA,
      puzzle2PDA,
      adminGbTokenAccount,
      adminUsdcTokenAccount,
      creator1GbTokenAccount,
      creator1UsdcTokenAccount,
      creator2GbTokenAccount,
      creator2UsdcTokenAccount,
      solver1GbTokenAccount,
      solver1UsdcTokenAccount,
      solver2GbTokenAccount,
      solver2UsdcTokenAccount,
      solver3GbTokenAccount,
      solver3UsdcTokenAccount,
    });
  }

  async airdrop(publicKey: anchor.web3.PublicKey, amount: number) {
    await this.gbProgram.airdrop(publicKey, amount);
  }

  async faucetToken(
    mint: anchor.web3.PublicKey,
    tokenAccount: anchor.web3.PublicKey,
    amount: number
  ) {
    const mintDecimals = await this.gbProgram.getMintDecimals(mint);
    const amountLamports = toLamports(amount, mintDecimals);
    await mintTo(
      this.provider.connection,
      this.admin,
      mint,
      tokenAccount,
      this.promptsVerifier, // mint authority
      amountLamports.toNumber()
    );
  }

  async setGameConfig({
    admin,
    promptsVerifier,
    puzzlesVerifier,
    puzzleAttemptTimeoutSeconds,
    puzzleAttemptFinalTimeoutSeconds,
    maxAttempts,
    create = false,
  }: {
    admin: anchor.web3.Keypair;
    promptsVerifier: anchor.web3.PublicKey;
    puzzlesVerifier: anchor.web3.PublicKey;
    puzzleAttemptTimeoutSeconds: number;
    puzzleAttemptFinalTimeoutSeconds: number;
    maxAttempts: number;
    create?: boolean;
  }) {
    await this.gbProgram.setGameConfigWithPayer({
      promptsVerifier,
      puzzlesVerifier,
      admin,
      puzzleAttemptTimeoutSeconds,
      puzzleAttemptFinalTimeoutSeconds,
      maxAttempts,
      create,
    });

    const game = await this.gbProgram.getGame();
    expect(game.admin.toString()).toEqual(admin.publicKey.toString());
    expect(game.promptsVerifier.toString()).toEqual(promptsVerifier.toString());
    expect(game.puzzlesVerifier.toString()).toEqual(puzzlesVerifier.toString());
    expect(game.puzzleAttemptTimeoutSeconds.toNumber()).toEqual(
      puzzleAttemptTimeoutSeconds
    );
    expect(game.puzzleAttemptFinalTimeoutSeconds.toNumber()).toEqual(
      puzzleAttemptFinalTimeoutSeconds
    );
    expect(game.maxAttempts).toEqual(maxAttempts);
    await this.index();

    const gameRecord = await this.gbProgram.getGameRecord();
    expect(gameRecord.publicKey).toEqual(this.gamePDA.toBase58());
    expect(gameRecord.puzzleAttemptTimeoutSeconds).toEqual(
      puzzleAttemptTimeoutSeconds
    );
    expect(gameRecord.puzzleAttemptFinalTimeoutSeconds).toEqual(
      puzzleAttemptFinalTimeoutSeconds
    );
    expect(gameRecord.maxAttempts).toEqual(maxAttempts);
    expect(gameRecord.promptsVerifier.toString()).toEqual(
      promptsVerifier.toString()
    );
    expect(gameRecord.puzzlesVerifier.toString()).toEqual(
      puzzlesVerifier.toString()
    );
  }

  async setPuzzleCurrencyConfig({
    admin,
    mint,
    decimals,
    serviceFee,
    minimumInitialPrize,
    feeConfig,
    create = false,
  }: {
    admin: anchor.web3.Keypair;
    mint: anchor.web3.PublicKey;
    decimals: number;
    serviceFee: number;
    minimumInitialPrize: number;
    feeConfig: {
      baseFee: number;
      maxFee: number;
    };
    create?: boolean;
  }) {
    await this.gbProgram.setPuzzleCurrencyConfigWithPayer({
      admin,
      mint,
      serviceFee,
      minimumInitialPrize,
      feeConfig,
      create,
    });

    const puzzleCurrency = await this.gbProgram.getPuzzleCurrencyByMint(mint);
    expect(puzzleCurrency.mint.toString()).toEqual(mint.toString());
    expect(puzzleCurrency.serviceFeeBps / 1e4).toEqual(serviceFee);
    expect(fromLamports(puzzleCurrency.feeConfig.baseFee, decimals)).toEqual(
      feeConfig.baseFee
    );
    expect(fromLamports(puzzleCurrency.feeConfig.maxFee, decimals)).toEqual(
      feeConfig.maxFee
    );
    expect(fromLamports(puzzleCurrency.minimumInitialPrize, decimals)).toEqual(
      minimumInitialPrize
    );
    await this.index();

    const puzzleCurrencyRecord =
      await this.gbProgram.getPuzzleCurrencyRecordByMint(mint);
    expect(puzzleCurrencyRecord.mint).toEqual(mint.toBase58());
    expect(puzzleCurrencyRecord.decimals).toEqual(decimals);
    expect(puzzleCurrencyRecord.serviceFeeBps).toEqual(serviceFee * 1e4);
    expect(
      fromLamports(puzzleCurrencyRecord.minimumInitialPrize, decimals)
    ).toEqual(minimumInitialPrize);
    expect(fromLamports(puzzleCurrencyRecord.baseFee, decimals)).toEqual(
      feeConfig.baseFee
    );
    expect(fromLamports(puzzleCurrencyRecord.maxFee, decimals)).toEqual(
      feeConfig.maxFee
    );
  }

  async transferAdmin({
    newAdmin,
    admin,
  }: {
    admin: anchor.web3.Keypair;
    newAdmin: anchor.web3.PublicKey;
  }) {
    await this.airdrop(newAdmin, 1);
    await this.gbProgram.transferAdminWithPayer({
      newAdmin,
      admin,
    });

    const game = await this.gbProgram.getGame();
    expect(game.admin.toString()).toEqual(newAdmin.toString());
  }

  async createPuzzle({
    creator,
    puzzlePDA,
    prizeAmount,
    prompt,
    name = 'Test Puzzle',
    avatarUrl = 'https://example.com/avatar.png',
    metadata = '{}',
    mint,
    puzzleNonce,
    maxAttempts,
    baseFee,
    maxFee,
    attemptTimeoutSeconds,
    attemptFinalTimeoutSeconds,
    expectedGameTotalPuzzlesCreated,
    expectedWalletTotalPuzzlesCreated,
    expectedPuzzleCurrentFee,
    expectedGameTotalPrizesEscrowed,
  }: {
    creator: anchor.web3.Keypair;
    puzzlePDA: anchor.web3.PublicKey;
    mint: anchor.web3.PublicKey;
    prizeAmount: number;
    prompt: string;
    name?: string;
    avatarUrl?: string;
    metadata?: string;
    puzzleNonce: number;
    maxAttempts?: number;
    baseFee?: number;
    maxFee?: number;
    attemptTimeoutSeconds?: number;
    attemptFinalTimeoutSeconds?: number;
    expectedGameTotalPuzzlesCreated: number;
    expectedWalletTotalPuzzlesCreated: number;
    expectedPuzzleCurrentFee: number;
    expectedGameTotalPrizesEscrowed: number;
  }) {
    const game = await this.gbProgram.getGame();
    const decimals = await this.gbProgram.getMintDecimals(mint);
    const initialCreatorBalance = await this.getMintBalance(
      mint,
      creator.publicKey
    );

    const escrowPDA = this.gbProgram.getPuzzleEscrowPDA({
      creator: creator.publicKey,
      nonce: puzzleNonce,
    });
    const puzzleCurrency = await this.gbProgram.getPuzzleCurrencyByMint(mint);

    const { tx: initializedTx, blockhashWithExpiryBlockHeight } =
      await this.gbProgram.initCreatePuzzleWithPayer({
        puzzlePDA,
        mint,
        prizeAmount,
        prompt,
        puzzleNonce,
        creator,
        name,
        avatarUrl,
        model: DEFAULT_EVALUATION_MODEL,
        metadata,
        baseFee:
          baseFee || fromLamports(puzzleCurrency.feeConfig.baseFee, decimals),
        maxFee:
          maxFee || fromLamports(puzzleCurrency.feeConfig.maxFee, decimals),
        maxAttempts: maxAttempts || game.maxAttempts,
        attemptTimeoutSeconds:
          attemptTimeoutSeconds || game.puzzleAttemptTimeoutSeconds.toNumber(),
        attemptFinalTimeoutSeconds:
          attemptFinalTimeoutSeconds ||
          game.puzzleAttemptFinalTimeoutSeconds.toNumber(),
      });

    const tx = deserializeTx(initializedTx);

    const mockVerifyPuzzleSystemPrompt = jest
      .spyOn(libLLM, 'verifyPuzzlePrompt')
      .mockResolvedValue(void 0);

    await this.gbProgram.finalizeCreatePuzzleWithPayer({
      mint,
      tx: serializeTx({ tx, requireAllSignatures: false }),
      prompt,
      metadata,
      promptsVerifier: this.promptsVerifier,
      blockhashWithExpiryBlockHeight,
    });

    expect(mockVerifyPuzzleSystemPrompt).toHaveBeenCalledWith(prompt);

    const puzzleAccount = await this.gbProgram.getPuzzle(puzzlePDA);
    expect(puzzleAccount.creator.toString()).toEqual(
      creator.publicKey.toString()
    );
    expect(puzzleAccount.status.active).not.toBeUndefined();
    expect(fromLamports(puzzleAccount.initialPrize, decimals)).toEqual(
      prizeAmount
    );
    expect(Buffer.from(puzzleAccount.promptHash).toString('hex')).toEqual(
      Buffer.from(await hashText(prompt)).toString('hex')
    );
    expect(puzzleAccount.nonce.toNumber()).toEqual(puzzleNonce);
    expect(Buffer.from(puzzleAccount.metadataHash).toString('hex')).toEqual(
      Buffer.from(await hashText(metadata)).toString('hex')
    );
    expect(puzzleAccount.currencyMint.toString()).toEqual(mint.toString());
    expect(puzzleAccount.currencyServiceFeeBps).toEqual(
      puzzleCurrency.serviceFeeBps
    );
    expect(puzzleAccount.currencyBaseFee.toNumber()).toEqual(
      puzzleCurrency.feeConfig.baseFee.toNumber()
    );
    expect(puzzleAccount.currencyMaxFee.toNumber()).toEqual(
      puzzleCurrency.feeConfig.maxFee.toNumber()
    );
    expect(puzzleAccount.maxAttempts).toEqual(game.maxAttempts);
    expect(puzzleAccount.attemptTimeoutSeconds.toNumber()).toEqual(
      game.puzzleAttemptTimeoutSeconds.toNumber()
    );
    expect(puzzleAccount.attemptFinalTimeoutSeconds.toNumber()).toEqual(
      game.puzzleAttemptFinalTimeoutSeconds.toNumber()
    );
    expect(puzzleAccount.totalAttemptsMade.toNumber()).toEqual(0);

    const escrowBalance = await this.getEscrowMintBalance(mint, escrowPDA);
    const finalCreatorBalance = await this.getMintBalance(
      mint,
      creator.publicKey
    );
    // escrow balance increases
    expect(escrowBalance).toBeCloseTo(prizeAmount, 2);
    // creator balance decreases
    expect(initialCreatorBalance - finalCreatorBalance).toBeCloseTo(
      prizeAmount,
      2
    );
    await this.index();

    const [gameRecord, puzzleCurrencyRecord] = await Promise.all([
      this.gbProgram.getGameRecord(),
      this.gbProgram.getPuzzleCurrencyRecordByMint(mint),
    ]);
    expect(gameRecord.publicKey).toEqual(this.gamePDA.toBase58());
    expect(gameRecord.totalPuzzlesCreated).toEqual(
      expectedGameTotalPuzzlesCreated
    );
    expect(
      fromLamports(puzzleCurrencyRecord.totalPrizesEscrowed, decimals)
    ).toEqual(expectedGameTotalPrizesEscrowed);

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(puzzlePDA);
    expect(puzzleRecord.publicKey).toEqual(puzzlePDA.toBase58());
    expect(puzzleRecord.creator).toEqual(creator.publicKey.toBase58());
    expect(puzzleRecord.status).toEqual('Active');
    expect(fromLamports(puzzleRecord.initialPrize, decimals)).toEqual(
      prizeAmount
    );
    expect(puzzleRecord.prompt).toEqual(prompt);
    expect(puzzleRecord.nonce).toEqual(puzzleNonce);
    expect(fromLamports(puzzleRecord.currentFee, decimals)).toEqual(
      expectedPuzzleCurrentFee
    );
    expect(puzzleRecord.name).toEqual(name);
    expect(puzzleRecord.avatarUrl).toEqual(avatarUrl);
    expect(puzzleRecord.model).toEqual(DEFAULT_EVALUATION_MODEL);
    expect(puzzleRecord.metadata).toEqual(metadata);
    expect(puzzleRecord.currencyMint.toString()).toEqual(mint.toString());
    expect(puzzleRecord.currencyServiceFeeBps).toEqual(
      puzzleCurrency.serviceFeeBps
    );
    expect(fromLamports(puzzleRecord.currencyBaseFee, decimals)).toEqual(
      fromLamports(puzzleCurrency.feeConfig.baseFee, decimals)
    );
    expect(fromLamports(puzzleRecord.currencyMaxFee, decimals)).toEqual(
      fromLamports(puzzleCurrency.feeConfig.maxFee, decimals)
    );
    expect(puzzleRecord.maxAttempts).toEqual(game.maxAttempts);
    expect(puzzleRecord.attemptTimeoutSeconds).toEqual(
      game.puzzleAttemptTimeoutSeconds.toNumber()
    );
    expect(puzzleRecord.attemptFinalTimeoutSeconds).toEqual(
      game.puzzleAttemptFinalTimeoutSeconds.toNumber()
    );

    const playerActivityRecord = await this.gbProgram.getPlayerActivityRecord(
      creator.publicKey
    );
    expect(playerActivityRecord.publicKey).toEqual(
      creator.publicKey.toBase58()
    );
    expect(playerActivityRecord.totalPuzzlesCreated).toEqual(
      expectedWalletTotalPuzzlesCreated
    );
  }

  async recordAttempt({
    solver,
    puzzlePDA,
    prompt,
    expectedFee,
    maxFee,
    myChat = false,
    evaluationResult,
    expectedGameTotalAttemptsMade,
    expectedGameTotalFeesPaid,
    expectedPuzzleTotalAttemptsMade,
    expectedPuzzleTotalFeesPaid,
    expectedWalletTotalAttemptsMade,
    expectedWalletTotalFeesPaid,
    expectedPuzzleNextFee,
  }: IRecordAttempt & {
    evaluationResult?: IRecordAttemptEvaluationResult;
  }) {
    let puzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    const decimals = await this.gbProgram.getMintDecimals(puzzle.currencyMint);
    const currentFee = fromLamports(
      await this.gbProgram.getCurrentFee({
        puzzlePDA,
      }),
      decimals
    );
    expect(currentFee).toEqual(expectedFee);
    const escrowPDA = this.gbProgram.getPuzzleEscrowPDA({
      creator: puzzle.creator,
      nonce: puzzle.nonce.toNumber(),
    });

    const initialSolverBalance = await this.getMintBalance(
      puzzle.currencyMint,
      solver.publicKey
    );
    const initialEscrowBalance = await this.getEscrowMintBalance(
      puzzle.currencyMint,
      escrowPDA
    );

    const metadataObj = { myChat };
    const metadata = JSON.stringify(metadataObj);

    const { tx: initializedTx, blockhashWithExpiryBlockHeight } =
      await this.gbProgram.initRecordAttemptWithPayer({
        puzzlePDA,
        maxFee: maxFee || expectedFee,
        prompt,
        solver,
        metadata,
      });
    const tx = deserializeTx(initializedTx);
    const mockVerifyPuzzleAttemptUserPrompt = jest
      .spyOn(libLLM, 'verifyAttemptPrompt')
      .mockResolvedValue(void 0);
    await this.gbProgram.finalizeRecordAttemptWithPayer({
      mint: puzzle.currencyMint,
      tx: serializeTx({ tx, requireAllSignatures: false }),
      prompt,
      metadata,
      promptsVerifier: this.promptsVerifier,
      blockhashWithExpiryBlockHeight,
    });
    expect(mockVerifyPuzzleAttemptUserPrompt).toHaveBeenCalledWith(prompt);

    const finalSolverBalance = await this.getMintBalance(
      puzzle.currencyMint,
      solver.publicKey
    );
    const finalEscrowBalance = await this.getEscrowMintBalance(
      puzzle.currencyMint,
      escrowPDA
    );

    // solver balance decreases
    expect(initialSolverBalance - finalSolverBalance).toBeCloseTo(
      expectedFee,
      2
    );
    // escrow balance increases
    expect(finalEscrowBalance - initialEscrowBalance).toBeCloseTo(
      expectedFee,
      2
    );

    puzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    if (puzzle.status.attempted) {
      expect(puzzle.status.attempted.solver.toString()).toEqual(
        solver.publicKey.toString()
      );
      expect(
        puzzle.status.attempted.timestamp.gt(new anchor.BN(0))
      ).toBeTruthy();
      expect(puzzle.totalAttemptsMade.toNumber()).toEqual(
        expectedPuzzleTotalAttemptsMade
      );
    } else {
      expect(false).toBeTruthy(); // Should not reach here
    }
    await this.index();
    const puzzleRecord = await this.gbProgram.getPuzzleRecord(puzzlePDA);
    expect(puzzleRecord.status).toEqual('Attempted');
    expect(puzzleRecord.lastAttemptSolver).toEqual(solver.publicKey.toBase58());
    expect(puzzleRecord.lastAttemptPrompt).toEqual(prompt);
    expect(puzzleRecord.totalAttemptsMade).toEqual(
      expectedPuzzleTotalAttemptsMade
    );
    const puzzleCurrencyRecord =
      await this.gbProgram.getPuzzleCurrencyRecordByMint(puzzle.currencyMint);
    expect(fromLamports(puzzleCurrencyRecord.totalFeesPaid, decimals)).toEqual(
      expectedGameTotalFeesPaid
    );
    expect(fromLamports(puzzleRecord.currentFee, decimals)).toEqual(
      expectedPuzzleNextFee
    );
    const [playerActivityRecord, playerCurrencyStatsRecord] = await Promise.all(
      [
        this.gbProgram.getPlayerActivityRecord(solver.publicKey),
        this.gbProgram.getPlayerCurrencyStatsRecord({
          player: solver.publicKey,
          mint: puzzle.currencyMint,
        }),
      ]
    );
    expect(playerActivityRecord.totalAttemptsMade).toEqual(
      expectedWalletTotalAttemptsMade
    );
    expect(
      fromLamports(playerCurrencyStatsRecord.totalFeesPaid, decimals)
    ).toEqual(expectedWalletTotalFeesPaid);
    const puzzleAttemptRecord =
      await this.gbProgram.getLatestPuzzleAttemptRecord({
        puzzle: puzzlePDA,
        solver: solver.publicKey,
      });
    expect(puzzleAttemptRecord.prompt).toEqual(prompt);
    if (evaluationResult) {
      await this.evaluateRecordAttempt({
        solver,
        puzzlePDA,
        expectedFee,
        maxFee,
        prompt,
        myChat,
        evaluationResult,
        expectedGameTotalAttemptsMade,
        expectedGameTotalFeesPaid,
        expectedPuzzleTotalAttemptsMade,
        expectedPuzzleTotalFeesPaid,
        expectedWalletTotalAttemptsMade,
        expectedWalletTotalFeesPaid,
        expectedPuzzleNextFee,
      });
    }
  }

  async evaluateRecordAttempt({
    solver,
    puzzlePDA,
    prompt,
    evaluationResult,
    expectedGameTotalAttemptsMade,
    expectedGameTotalFeesPaid,
    expectedPuzzleTotalAttemptsMade,
    expectedPuzzleTotalFeesPaid,
    expectedWalletTotalAttemptsMade,
    expectedWalletTotalFeesPaid,
    expectedPuzzleNextFee,
  }: IRecordAttempt & {
    evaluationResult: IRecordAttemptEvaluationResult;
  }) {
    let puzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    const decimals = await this.gbProgram.getMintDecimals(puzzle.currencyMint);
    const systemPrompt = await this.gbProgram.getMessageFromHashBytes(
      puzzle.promptHash
    );

    const escrowPDA = this.gbProgram.getPuzzleEscrowPDA({
      creator: puzzle.creator,
      nonce: puzzle.nonce.toNumber(),
    });

    const initialServiceBalance = await this.getMintBalance(
      puzzle.currencyMint,
      this.admin.publicKey
    );
    const initialEscrowBalance = await this.getEscrowMintBalance(
      puzzle.currencyMint,
      escrowPDA
    );

    const mockLLMPrompt = jest
      .spyOn(programLLM, 'evaluatePrompt')
      .mockResolvedValue({
        approve: !!evaluationResult.approvedTransfer,
        response: evaluationResult.response,
      });
    await this.verify();
    expect(mockLLMPrompt).toHaveBeenCalledWith({
      systemPrompt,
      latestUserPrompt: prompt,
      pastUserPrompts: evaluationResult.pastUserPrompts,
      model: DEFAULT_EVALUATION_MODEL,
    });

    const [gameRecord, puzzleCurrencyRecord] = await Promise.all([
      this.gbProgram.getGameRecord(),
      this.gbProgram.getPuzzleCurrencyRecordByMint(puzzle.currencyMint),
    ]);
    expect(gameRecord.totalAttemptsMade).toEqual(expectedGameTotalAttemptsMade);
    expect(fromLamports(puzzleCurrencyRecord.totalFeesPaid, decimals)).toEqual(
      expectedGameTotalFeesPaid
    );

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(puzzlePDA);
    expect(puzzleRecord.status).toEqual('Attempted');
    expect(puzzleRecord.lastAttemptSolver).toEqual(solver.publicKey.toBase58());
    expect(puzzleRecord.lastAttemptPrompt).toEqual(prompt);
    expect(puzzleRecord.totalAttemptsMade).toEqual(
      expectedPuzzleTotalAttemptsMade
    );
    expect(fromLamports(puzzleRecord.currentFee, decimals)).toEqual(
      expectedPuzzleNextFee
    );
    expect(fromLamports(puzzleRecord.totalFeesPaid, decimals)).toEqual(
      expectedPuzzleTotalFeesPaid
    );

    const [playerActivityRecord, playerCurrencyStatsRecord] = await Promise.all(
      [
        this.gbProgram.getPlayerActivityRecord(solver.publicKey),
        this.gbProgram.getPlayerCurrencyStatsRecord({
          player: solver.publicKey,
          mint: puzzle.currencyMint,
        }),
      ]
    );

    expect(playerActivityRecord.totalAttemptsMade).toEqual(
      expectedWalletTotalAttemptsMade
    );
    expect(
      fromLamports(playerCurrencyStatsRecord.totalFeesPaid, decimals)
    ).toEqual(expectedWalletTotalFeesPaid);

    const puzzleAttemptRecord =
      await this.gbProgram.getLatestPuzzleAttemptRecord({
        puzzle: puzzlePDA,
        solver: solver.publicKey,
      });
    expect(puzzleAttemptRecord.prompt).toEqual(prompt);

    puzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    if (evaluationResult.approvedTransfer) {
      await this.expectApprovedTransfer({
        puzzlePDA,
        solver,
        response: evaluationResult.response,
        ...evaluationResult.approvedTransfer,
        initialServiceBalance,
        initialEscrowBalance,
      });
    } else {
      await this.expectRejectedTransfer({
        puzzlePDA,
        response: evaluationResult.response,
      });
    }
  }

  async expectRejectedTransfer({
    puzzlePDA,
    response,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    response: string;
  }) {
    let puzzleRecord = await this.gbProgram.getPuzzleRecord(puzzlePDA);
    const solver = puzzleRecord.lastAttemptSolver;
    if (!solver) {
      throw new Error('Solver not set');
    }

    // puzzle record transitions from attempted to active
    await this.index();

    puzzleRecord = await this.gbProgram.getPuzzleRecord(puzzlePDA);
    expect(puzzleRecord.status).toEqual('Active');

    const puzzleAttemptRecord =
      await this.gbProgram.getLatestPuzzleAttemptRecord({
        puzzle: puzzlePDA,
        solver: new anchor.web3.PublicKey(solver),
      });
    expect(puzzleAttemptRecord.response).toEqual(response);
  }

  async expectApprovedTransfer({
    puzzlePDA,
    solver,
    response,
    expectedSolverShare,
    expectedServiceShare,
    expectedShareApproximation,
    expectedGameTotalPuzzlesSolved,
    expectedWalletTotalPuzzlesSolved,
    initialServiceBalance,
    initialEscrowBalance,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    solver: anchor.web3.Keypair;
    response: string;
    initialServiceBalance: number;
    initialEscrowBalance: number;
  } & IExpectApprovedTransferExtras) {
    const puzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    const decimals = await this.gbProgram.getMintDecimals(puzzle.currencyMint);

    await this.index();

    const escrowPDA = this.gbProgram.getPuzzleEscrowPDA({
      creator: puzzle.creator,
      nonce: puzzle.nonce.toNumber(),
    });

    const finalServiceBalance = await this.getMintBalance(
      puzzle.currencyMint,
      this.admin.publicKey
    );
    const finalEscrowBalance = await this.getEscrowMintBalance(
      puzzle.currencyMint,
      escrowPDA
    );

    // service share increases
    expect(finalServiceBalance - initialServiceBalance).toBeCloseTo(
      expectedServiceShare,
      expectedShareApproximation
    );
    // escrow decreases
    expect(initialEscrowBalance - finalEscrowBalance).toBeCloseTo(
      expectedServiceShare,
      expectedShareApproximation
    );

    expect(puzzle.status.approvedTransfer).not.toBeUndefined();
    expect(puzzle.status.approvedTransfer!.solvedAt.toNumber()).toBeGreaterThan(
      0
    );
    expect(
      fromLamports(puzzle.status.approvedTransfer!.solverShare, decimals)
    ).toBeCloseTo(expectedSolverShare, expectedShareApproximation);
    expect(
      fromLamports(puzzle.status.approvedTransfer!.serviceShare, decimals)
    ).toBeCloseTo(expectedServiceShare, expectedShareApproximation);

    const gameRecord = await this.gbProgram.getGameRecord();
    expect(gameRecord.totalPuzzlesSolved).toEqual(
      expectedGameTotalPuzzlesSolved
    );

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(puzzlePDA);

    expect(puzzleRecord.status).toEqual('ApprovedTransfer');
    expect(puzzleRecord.solver).toEqual(solver.publicKey.toBase58());
    expect(puzzleRecord.solvedAt).toBeGreaterThan(0);
    expect(fromLamports(puzzleRecord.solverShare!, decimals)).toBeCloseTo(
      expectedSolverShare,
      expectedShareApproximation
    );
    expect(fromLamports(puzzleRecord.serviceShare!, decimals)).toBeCloseTo(
      expectedServiceShare,
      expectedShareApproximation
    );

    const playerActivityRecord = await this.gbProgram.getPlayerActivityRecord(
      solver.publicKey
    );
    expect(playerActivityRecord.totalPuzzlesSolved).toEqual(
      expectedWalletTotalPuzzlesSolved
    );

    const puzzleAttemptRecord =
      await this.gbProgram.getLatestPuzzleAttemptRecord({
        puzzle: puzzlePDA,
        solver: solver.publicKey,
      });
    expect(puzzleAttemptRecord.response).toEqual(response);
  }

  async claimPrize({
    puzzlePDA,
    solver,
    expectedSolverShare,
    expectedShareApproximation,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    solver: anchor.web3.Keypair;
    expectedSolverShare: number;
    expectedShareApproximation: number;
  }) {
    const puzzle = await this.gbProgram.getPuzzle(puzzlePDA);

    const escrowPDA = this.gbProgram.getPuzzleEscrowPDA({
      creator: puzzle.creator,
      nonce: puzzle.nonce.toNumber(),
    });

    const initialSolverBalance = await this.getMintBalance(
      puzzle.currencyMint,
      solver.publicKey
    );
    const initialEscrowBalance = await this.getEscrowMintBalance(
      puzzle.currencyMint,
      escrowPDA
    );

    await this.gbProgram.claimPrizeWithPayer({
      puzzlePDA,
      solver,
    });

    const finalSolverBalance = await this.getMintBalance(
      puzzle.currencyMint,
      solver.publicKey
    );
    const finalEscrowBalance = await this.getEscrowMintBalance(
      puzzle.currencyMint,
      escrowPDA
    );
    // solver balance increases
    expect(finalSolverBalance - initialSolverBalance).toBeCloseTo(
      expectedSolverShare,
      expectedShareApproximation
    );
    // escrow decreases
    expect(initialEscrowBalance - finalEscrowBalance).toBeCloseTo(
      expectedSolverShare,
      expectedShareApproximation
    );

    const updatedPuzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    expect(updatedPuzzle.status.completed).not.toBeUndefined();

    await this.index();

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(puzzlePDA);
    expect(puzzleRecord.status).toEqual('Completed');
  }

  async creatorClaimTimeout({
    puzzlePDA,
    expectedRefund,
    expectedRefundApproximation,
    expectedServiceShare,
    expectedServiceShareApproximation,
    expectedEscrowChangeApproximation = 4,
    expectedGameTotalPuzzlesTimedOut,
    expectedGameTotalPuzzlesTimedOutValue,
    expectedPlayerTotalPuzzlesTimedOut,
    expectedPlayerTotalPuzzlesTimedOutValue,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    expectedRefund: number;
    expectedRefundApproximation: number;
    expectedServiceShare: number;
    expectedServiceShareApproximation: number;
    expectedEscrowChangeApproximation?: number;
    expectedGameTotalPuzzlesTimedOut: number;
    expectedGameTotalPuzzlesTimedOutValue: number;
    expectedPlayerTotalPuzzlesTimedOut: number;
    expectedPlayerTotalPuzzlesTimedOutValue: number;
  }) {
    let puzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    const decimals = await this.gbProgram.getMintDecimals(puzzle.currencyMint);
    const creator = this.creators.find((c) =>
      c.publicKey.equals(puzzle.creator)
    );
    if (!creator) {
      expect(false).toBeTruthy();
      throw new Error('Creator not found');
    }

    const escrowPDA = this.gbProgram.getPuzzleEscrowPDA({
      creator: puzzle.creator,
      nonce: puzzle.nonce.toNumber(),
    });

    const initialCreatorBalance = await this.getMintBalance(
      puzzle.currencyMint,
      creator.publicKey
    );
    const initialEscrowBalance = await this.getEscrowMintBalance(
      puzzle.currencyMint,
      escrowPDA
    );
    const initialServiceBalance = await this.getMintBalance(
      puzzle.currencyMint,
      this.admin.publicKey
    );

    await this.gbProgram.claimTimeoutWithPayer({
      puzzlePDA,
      creator,
    });

    const finalCreatorBalance = await this.getMintBalance(
      puzzle.currencyMint,
      creator.publicKey
    );
    const finalEscrowBalance = await this.getEscrowMintBalance(
      puzzle.currencyMint,
      escrowPDA
    );
    const finalServiceBalance = await this.getMintBalance(
      puzzle.currencyMint,
      this.admin.publicKey
    );

    // creator balance increases
    expect(finalCreatorBalance - initialCreatorBalance).toBeCloseTo(
      expectedRefund,
      expectedRefundApproximation
    );
    // service balance increases
    expect(finalServiceBalance - initialServiceBalance).toBeCloseTo(
      expectedServiceShare,
      expectedServiceShareApproximation
    );
    // escrow decreases
    expect(initialEscrowBalance - finalEscrowBalance).toBeCloseTo(
      expectedRefund + expectedServiceShare,
      expectedEscrowChangeApproximation
    );
    expect(finalEscrowBalance).toBe(0);

    puzzle = await this.gbProgram.getPuzzle(puzzlePDA);
    expect(puzzle.status.timedOut).toBeDefined();

    await this.index();

    const puzzleRecord = await this.gbProgram.getPuzzleRecord(puzzlePDA);
    expect(puzzleRecord.status).toEqual('TimedOut');

    const gameRecord = await this.gbProgram.getGameRecord();
    expect(gameRecord.totalPuzzlesTimedOut).toEqual(
      expectedGameTotalPuzzlesTimedOut
    );

    const puzzleCurrencyRecord =
      await this.gbProgram.getPuzzleCurrencyRecordByMint(puzzle.currencyMint);
    expect(
      fromLamports(puzzleCurrencyRecord.totalPuzzlesTimedOutValue, decimals)
    ).toEqual(expectedGameTotalPuzzlesTimedOutValue);

    const playerActivityRecord = await this.gbProgram.getPlayerActivityRecord(
      creator.publicKey
    );
    expect(playerActivityRecord.totalPuzzlesTimedOut).toEqual(
      expectedPlayerTotalPuzzlesTimedOut
    );

    const playerCurrencyStatsRecord =
      await this.gbProgram.getPlayerCurrencyStatsRecord({
        player: creator.publicKey,
        mint: puzzle.currencyMint,
      });
    expect(
      fromLamports(
        playerCurrencyStatsRecord.totalPuzzlesTimedOutValue,
        decimals
      )
    ).toEqual(expectedPlayerTotalPuzzlesTimedOutValue);
  }

  async getEscrowMintBalance(
    mint: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    const decimals = await this.gbProgram.getMintDecimals(mint);
    const mintIsNative = this.gbProgram.getMintIsNative(mint);
    return mintIsNative
      ? fromLamports(await this.provider.connection.getBalance(owner), decimals)
      : fromLamports(
          await this.gbProgram.getTokenAccountBalance(owner),
          decimals
        );
  }

  async getMintBalance(
    mint: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    const decimals = await this.gbProgram.getMintDecimals(mint);
    const mintIsNative = this.gbProgram.getMintIsNative(mint);
    return mintIsNative
      ? fromLamports(await this.provider.connection.getBalance(owner), decimals)
      : fromLamports(
          await this.gbProgram.getTokenAccountBalanceByMintAndOwner(
            mint,
            owner
          ),
          decimals
        );
  }
}
