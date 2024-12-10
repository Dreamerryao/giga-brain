import * as anchor from '@coral-xyz/anchor';
import {
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import { AVAILABLE_MODELS, utils as llm } from '../llm';
import { toLamports } from '../bn';
import { hashText } from '../crypto';
import { sleep } from '../promise';

import { Gb } from './gb';
import GB_IDL from './gb.json';
import { deserializeTx, serializeTx } from './tx';
import { getPriorityFeeEstimateMicroLamports } from './priority-fees';
import { COMMITMENT } from './provider';

export const IDL = {
  ...GB_IDL,
  address: process.env.NEXT_PUBLIC_GIGA_PROGRAM!,
} as Gb;

export abstract class BaseGbProgram {
  program: anchor.Program<Gb>;
  gamePDA: anchor.web3.PublicKey;

  constructor(program: anchor.Program<Gb>) {
    this.program = program;
    this.gamePDA = this.getPDA([Buffer.from('game')]);
  }

  abstract storeMessage({
    content,
    hash,
  }: {
    content: string;
    hash: number[];
  }): Promise<void>;

  async setGameConfigWithPayer({
    admin,
    puzzlesVerifier,
    promptsVerifier,
    puzzleAttemptTimeoutSeconds,
    puzzleAttemptFinalTimeoutSeconds,
    maxAttempts,
    create = false,
  }: {
    admin: anchor.web3.Keypair;
    puzzlesVerifier: anchor.web3.PublicKey;
    promptsVerifier: anchor.web3.PublicKey;
    puzzleAttemptTimeoutSeconds: number;
    puzzleAttemptFinalTimeoutSeconds: number;
    maxAttempts: number;
    create?: boolean;
  }) {
    const tx = await (
      create
        ? this.program.methods.initialize
        : this.program.methods.setGameConfig
    )({
      puzzleAttemptTimeoutSeconds: new anchor.BN(puzzleAttemptTimeoutSeconds),
      puzzleAttemptFinalTimeoutSeconds: new anchor.BN(
        puzzleAttemptFinalTimeoutSeconds
      ),
      maxAttempts,
    })
      .accountsStrict({
        game: this.gamePDA,
        admin: admin.publicKey,
        puzzlesVerifier,
        promptsVerifier,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .transaction();

    return await this.completeAndSendTx({ tx, payer: admin });
  }

  async setPuzzleCurrencyConfigWithPayer({
    admin,
    mint,
    serviceFee,
    minimumInitialPrize,
    feeConfig,
    create = false,
  }: {
    admin: anchor.web3.Keypair;
    mint: anchor.web3.PublicKey;
    serviceFee: number;
    minimumInitialPrize: number;
    feeConfig: {
      baseFee: number;
      maxFee: number;
    };
    create?: boolean;
  }) {
    const puzzleCurrencyPDA = this.getPuzzleCurrencyPDA({ mint });
    const decimals = await this.getMintDecimals(mint);
    const tx = await (
      create
        ? this.program.methods.createPuzzleCurrencyConfig
        : this.program.methods.setPuzzleCurrencyConfig
    )({
      mint,
      serviceFeeBps: serviceFee * 1e4,
      minimumInitialPrize: toLamports(minimumInitialPrize, decimals),
      feeConfig: {
        baseFee: toLamports(feeConfig.baseFee, decimals),
        maxFee: toLamports(feeConfig.maxFee, decimals),
      },
    })
      .accountsStrict({
        puzzleCurrency: puzzleCurrencyPDA,
        admin: admin.publicKey,
        mint,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .transaction();

    return await this.completeAndSendTx({ tx, payer: admin });
  }

  async transferAdminWithPayer({
    newAdmin,
    admin,
  }: {
    newAdmin: anchor.web3.PublicKey;
    admin: anchor.web3.Keypair;
  }) {
    const tx = await this.program.methods
      .transferAdmin()
      .accountsStrict({
        game: this.gamePDA,
        admin: admin.publicKey,
        newAdmin,
      })
      .signers([admin])
      .transaction();
    return await this.completeAndSendTx({ tx, payer: admin });
  }

  async initCreatePuzzleWithPayer({
    puzzlePDA,
    mint,
    prizeAmount,
    prompt,
    puzzleNonce,
    creator,
    name,
    avatarUrl,
    model,
    metadata,
    baseFee,
    maxFee,
    maxAttempts,
    attemptTimeoutSeconds,
    attemptFinalTimeoutSeconds,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    mint: anchor.web3.PublicKey;
    prizeAmount: number;
    prompt: string;
    puzzleNonce: number;
    creator: anchor.web3.Keypair;
    name: string;
    avatarUrl: string;
    model: string;
    metadata: string;
    baseFee: number;
    maxFee: number;
    maxAttempts: number;
    attemptTimeoutSeconds: number;
    attemptFinalTimeoutSeconds: number;
  }) {
    const { tx, blockhashWithExpiryBlockHeight } = await this.initCreatePuzzle({
      puzzlePDA,
      mint,
      prizeAmount,
      prompt,
      puzzleNonce,
      creator: creator.publicKey,
      name,
      avatarUrl,
      model,
      metadata,
      baseFee,
      maxFee,
      maxAttempts,
      attemptTimeoutSeconds,
      attemptFinalTimeoutSeconds,
    });

    await this.addPriorityFeeIx({ tx });

    return {
      tx: await this.partialSignPromptTx({
        tx,
        payerPubkey: creator.publicKey,
        payer: creator,
        blockhashWithExpiryBlockHeight,
      }),
      blockhashWithExpiryBlockHeight,
    };
  }

  async initCreatePuzzle({
    puzzlePDA,
    mint,
    prizeAmount,
    prompt,
    puzzleNonce,
    name,
    avatarUrl,
    creator,
    model,
    metadata,
    baseFee,
    maxFee,
    maxAttempts,
    attemptTimeoutSeconds,
    attemptFinalTimeoutSeconds,
    commitment,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    mint: anchor.web3.PublicKey;
    prizeAmount: number;
    prompt: string;
    puzzleNonce: number;
    name: string;
    avatarUrl: string;
    creator: anchor.web3.PublicKey;
    model: string;
    metadata: string;
    baseFee: number;
    maxFee: number;
    maxAttempts: number;
    attemptTimeoutSeconds: number;
    attemptFinalTimeoutSeconds: number;
    commitment?: anchor.web3.Commitment;
  }) {
    const promptHash = await hashText(prompt);
    const metadataHash = await hashText(metadata);
    const game = await this.getGame();
    const promptsVerifier = game.promptsVerifier;

    const escrowPDA = this.getPuzzleEscrowPDA({ creator, nonce: puzzleNonce });
    const creatorToken = await this.getTokenAccountAddress(mint, creator);
    const decimals = await this.getMintDecimals(mint);
    const puzzleCurrencyPDA = this.getPuzzleCurrencyPDA({ mint });

    if (
      model !== 'random' &&
      AVAILABLE_MODELS.find((m) => m.company === model)
    ) {
      throw new Error('Invalid model');
    }
    const tx = await (this.getMintIsNative(mint)
      ? this.program.methods
          .createPuzzle(
            new anchor.BN(puzzleNonce),
            promptHash,
            toLamports(prizeAmount, decimals),
            name,
            avatarUrl,
            model,
            metadataHash,
            maxAttempts,
            toLamports(baseFee, decimals),
            toLamports(maxFee, decimals),
            new anchor.BN(attemptTimeoutSeconds),
            new anchor.BN(attemptFinalTimeoutSeconds)
          )
          .accountsStrict({
            game: this.gamePDA,
            puzzle: puzzlePDA,
            puzzleCurrency: puzzleCurrencyPDA,
            escrow: escrowPDA,
            creator,
            promptsVerifier,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .transaction()
      : this.program.methods
          .createPuzzleToken(
            new anchor.BN(puzzleNonce),
            promptHash,
            toLamports(prizeAmount, decimals),
            name,
            avatarUrl,
            model,
            metadataHash,
            maxAttempts,
            toLamports(baseFee, decimals),
            toLamports(maxFee, decimals),
            new anchor.BN(attemptTimeoutSeconds),
            new anchor.BN(attemptFinalTimeoutSeconds)
          )
          .accountsStrict({
            game: this.gamePDA,
            puzzle: puzzlePDA,
            puzzleCurrency: puzzleCurrencyPDA,
            mint,
            escrowToken: escrowPDA,
            creator,
            creatorToken: creatorToken,
            promptsVerifier,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .transaction());

    return this.populateTxWithRecentBlockhash({
      tx,
      payerPubkey: creator,
      commitment,
    });
  }

  async finalizeCreatePuzzleWithPayer({
    mint,
    tx,
    prompt,
    metadata,
    promptsVerifier,
    blockhashWithExpiryBlockHeight,
    commitment,
    confirmTx,
  }: {
    mint: anchor.web3.PublicKey;
    tx: string;
    prompt: string;
    metadata: string;
    promptsVerifier: anchor.web3.Keypair;
    blockhashWithExpiryBlockHeight: anchor.web3.BlockhashWithExpiryBlockHeight;
    commitment?: anchor.web3.Commitment;
    confirmTx?: boolean;
  }) {
    await llm.verifyPuzzlePrompt(prompt);
    await llm.verifyPuzzleMetadata(metadata);
    return this.finalizePrompt({
      tx,
      prompt,
      metadata,
      ixName: this.getMintIsNative(mint) ? 'createPuzzle' : 'createPuzzleToken',
      ixPayerAccountName: 'Creator',
      promptsVerifier,
      blockhashWithExpiryBlockHeight,
      commitment,
      confirmTx,
    });
  }

  async initRecordAttemptWithPayer({
    puzzlePDA,
    maxFee,
    prompt,
    solver,
    metadata,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    maxFee: number;
    prompt: string;
    solver: anchor.web3.Keypair;
    metadata: string;
  }) {
    const { tx, blockhashWithExpiryBlockHeight } = await this.initRecordAttempt(
      {
        puzzlePDA,
        maxFee,
        prompt,
        solver: solver.publicKey,
        metadata,
      }
    );

    await this.addPriorityFeeIx({ tx });

    return {
      tx: await this.partialSignPromptTx({
        tx,
        payerPubkey: solver.publicKey,
        payer: solver,
        blockhashWithExpiryBlockHeight,
      }),
      blockhashWithExpiryBlockHeight,
    };
  }

  async initRecordAttempt({
    puzzlePDA,
    maxFee,
    prompt,
    solver,
    metadata,
    commitment,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    maxFee: number;
    prompt: string;
    solver: anchor.web3.PublicKey;
    metadata: string;
    commitment?: anchor.web3.Commitment;
  }) {
    const promptHash = await hashText(prompt);
    const metadataHash = await hashText(metadata);
    const puzzle = await this.getPuzzle(puzzlePDA);
    const creator = puzzle.creator;
    const game = await this.getGame();
    const promptsVerifier = game.promptsVerifier;

    const mint = puzzle.currencyMint;
    const puzzleNonce = puzzle.nonce.toNumber();
    const escrowPDA = this.getPuzzleEscrowPDA({
      creator,
      nonce: puzzleNonce,
    });
    const solverToken = await this.getTokenAccountAddress(mint, solver);
    const puzzleCurrencyPDA = this.getPuzzleCurrencyPDA({ mint });
    const decimals = await this.getMintDecimals(mint);

    const tx = await (this.getMintIsNative(mint)
      ? this.program.methods
          .recordAttempt(
            new anchor.BN(puzzle.nonce),
            Array.from(promptHash),
            toLamports(maxFee, decimals),
            metadataHash
          )
          .accountsStrict({
            puzzle: puzzlePDA,
            solver,
            creator,
            promptsVerifier,
            escrow: escrowPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .transaction()
      : this.program.methods
          .recordAttemptToken(
            new anchor.BN(puzzle.nonce),
            Array.from(promptHash),
            toLamports(maxFee, decimals),
            metadataHash
          )
          .accountsStrict({
            puzzle: puzzlePDA,
            solver,
            solverToken: solverToken,
            creator,
            promptsVerifier,
            mint,
            escrowToken: escrowPDA,
            puzzleCurrency: puzzleCurrencyPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .transaction());

    return this.populateTxWithRecentBlockhash({
      tx,
      payerPubkey: solver,
      commitment,
    });
  }

  async finalizeRecordAttemptWithPayer({
    mint,
    tx,
    prompt,
    metadata,
    promptsVerifier,
    blockhashWithExpiryBlockHeight,
    commitment,
    confirmTx,
  }: {
    tx: string;
    mint: anchor.web3.PublicKey;
    prompt: string;
    metadata: string;
    promptsVerifier: anchor.web3.Keypair;
    blockhashWithExpiryBlockHeight: anchor.web3.BlockhashWithExpiryBlockHeight;
    commitment?: anchor.web3.Commitment;
    confirmTx?: boolean;
  }) {
    await llm.verifyAttemptPrompt(prompt);
    await llm.verifyAttemptMetadata(metadata);
    return this.finalizePrompt({
      tx,
      prompt,
      metadata,
      ixName: this.getMintIsNative(mint)
        ? 'recordAttempt'
        : 'recordAttemptToken',
      ixPayerAccountName: 'Solver',
      promptsVerifier,
      blockhashWithExpiryBlockHeight,
      commitment,
      confirmTx,
    });
  }

  async resolveAttemptWithPayer({
    puzzlePDA,
    response,
    puzzlesVerifier,
    approve,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    response: string;
    puzzlesVerifier: anchor.web3.Keypair;
    approve: boolean;
  }) {
    const responseHash = await hashText(response);
    await this.storeMessage({
      content: response,
      hash: responseHash,
    });

    const [game, puzzle] = await Promise.all([
      this.getGame(),
      this.getPuzzle(puzzlePDA),
    ]);
    const creator = puzzle.creator;

    let tx: anchor.web3.Transaction;

    if (!approve) {
      tx = await this.program.methods
        .rejectTransfer(new anchor.BN(puzzle.nonce), responseHash)
        .accountsStrict({
          game: this.gamePDA,
          puzzle: puzzlePDA,
          creator,
          puzzlesVerifier: puzzlesVerifier.publicKey,
        })
        .signers([puzzlesVerifier])
        .transaction();
    } else {
      const creator = puzzle.creator;
      const admin = game.admin;

      const escrowPDA = this.getPuzzleEscrowPDA({
        creator,
        nonce: puzzle.nonce.toNumber(),
      });
      const mint = puzzle.currencyMint;
      const adminToken = await this.getTokenAccountAddress(mint, admin);
      const puzzleCurrencyPDA = this.getPuzzleCurrencyPDA({ mint });

      tx = await (this.getMintIsNative(mint)
        ? this.program.methods
            .approveTransfer(new anchor.BN(puzzle.nonce), responseHash)
            .accountsStrict({
              game: this.gamePDA,
              puzzle: puzzlePDA,
              creator,
              admin,
              puzzlesVerifier: puzzlesVerifier.publicKey,
              escrow: escrowPDA,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([puzzlesVerifier])
            .transaction()
        : this.program.methods
            .approveTransferToken(new anchor.BN(puzzle.nonce), responseHash)
            .accountsStrict({
              game: this.gamePDA,
              puzzle: puzzlePDA,
              creator,
              admin,
              puzzlesVerifier: puzzlesVerifier.publicKey,
              escrowToken: escrowPDA,
              mint,
              adminToken: adminToken,
              puzzleCurrency: puzzleCurrencyPDA,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([puzzlesVerifier])
            .transaction());
    }

    return await this.completeAndSendTx({ tx, payer: puzzlesVerifier });
  }

  async claimPrize({
    puzzlePDA,
    solver,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    solver: anchor.web3.PublicKey;
  }) {
    const puzzle = await this.getPuzzle(puzzlePDA);
    const creator = puzzle.creator;

    const mint = puzzle.currencyMint;
    const puzzleNonce = puzzle.nonce.toNumber();

    const escrowPDA = this.getPuzzleEscrowPDA({
      creator,
      nonce: puzzleNonce,
    });
    const solverToken = await this.getTokenAccountAddress(mint, solver);
    const puzzleCurrencyPDA = this.getPuzzleCurrencyPDA({ mint });

    return this.getMintIsNative(puzzle.currencyMint)
      ? this.program.methods.claimPrize(puzzle.nonce).accountsStrict({
          game: this.gamePDA,
          puzzle: puzzlePDA,
          solver,
          creator,
          escrow: escrowPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
      : this.program.methods.claimPrizeToken(puzzle.nonce).accountsStrict({
          game: this.gamePDA,
          puzzle: puzzlePDA,
          solver,
          creator,
          escrowToken: escrowPDA,
          puzzleCurrency: puzzleCurrencyPDA,
          solverToken,
          mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        });
  }

  async creatorClaimTimeout({
    puzzlePDA,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
  }) {
    const puzzle = await this.getPuzzle(puzzlePDA);
    const creator = puzzle.creator;
    const game = await this.getGame();
    const mint = puzzle.currencyMint;
    const puzzleNonce = puzzle.nonce.toNumber();
    const escrowPDA = this.getPuzzleEscrowPDA({
      creator,
      nonce: puzzleNonce,
    });
    const creatorToken = await this.getTokenAccountAddress(mint, creator);
    const adminToken = await this.getTokenAccountAddress(mint, game.admin);
    const puzzleCurrencyPDA = this.getPuzzleCurrencyPDA({ mint });

    return this.getMintIsNative(puzzle.currencyMint)
      ? this.program.methods
          .creatorClaimTimeout(new anchor.BN(puzzle.nonce))
          .accountsStrict({
            game: this.gamePDA,
            puzzle: puzzlePDA,
            creator,
            escrow: escrowPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
            admin: game.admin,
          })
      : this.program.methods
          .creatorClaimTimeoutToken(new anchor.BN(puzzle.nonce))
          .accountsStrict({
            game: this.gamePDA,
            puzzle: puzzlePDA,
            creator,
            escrowToken: escrowPDA,
            mint,
            creatorToken: creatorToken,
            adminToken: adminToken,
            puzzleCurrency: puzzleCurrencyPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            admin: game.admin,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          });
  }

  async claimPrizeWithPayer({
    puzzlePDA,
    solver,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    solver: anchor.web3.Keypair;
  }) {
    const tx = await (
      await this.claimPrize({
        puzzlePDA,
        solver: solver.publicKey,
      })
    )
      .signers([solver])
      .transaction();

    return await this.completeAndSendTx({ tx, payer: solver });
  }

  async claimTimeoutWithPayer({
    puzzlePDA,
    creator,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
    creator: anchor.web3.Keypair;
  }) {
    const tx = await (
      await this.creatorClaimTimeout({
        puzzlePDA,
      })
    )
      .signers([creator])
      .transaction();
    return await this.completeAndSendTx({ tx, payer: creator });
  }

  async parseLocalTx<T>({
    tx,
    ixName,
  }: {
    tx: anchor.web3.Transaction;
    ixName: string;
  }) {
    const coder = this.program.coder
      .instruction as anchor.BorshInstructionCoder;
    for (const ix of tx.instructions) {
      const decodedIx = coder.decode(ix.data, 'base58');
      if (decodedIx) {
        const c = coder.format(decodedIx, ix.keys);
        if (c) {
          const { accounts } = c;
          const namedAccounts: Record<string, anchor.web3.PublicKey> = {};
          const remainingAccounts: anchor.web3.PublicKey[] = [];
          for (const account of accounts) {
            if (account.name) {
              namedAccounts[account.name] = new anchor.web3.PublicKey(
                account.pubkey.toString()
              );
            } else {
              remainingAccounts.push(
                new anchor.web3.PublicKey(account.pubkey.toString())
              );
            }
          }

          if (
            decodedIx.name === ixName &&
            ix.programId.equals(this.program.programId)
          ) {
            return {
              data: decodedIx.data as T,
              namedAccounts,
              remainingAccounts,
            };
          }
        }
      }
    }

    return null;
  }

  private async populateTxWithRecentBlockhash({
    tx,
    payerPubkey,
    commitment,
  }: {
    tx: anchor.web3.Transaction;
    payerPubkey: anchor.web3.PublicKey;
    commitment?: anchor.web3.Commitment;
  }) {
    const { blockhash, lastValidBlockHeight } =
      await this.program.provider.connection.getLatestBlockhash(commitment);
    tx.recentBlockhash = blockhash;
    // tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = payerPubkey;
    return {
      blockhashWithExpiryBlockHeight: {
        blockhash,
        lastValidBlockHeight,
      },
      commitment,
      tx,
    };
  }

  private async partialSignPromptTx({
    tx,
    payerPubkey,
    payer,
    blockhashWithExpiryBlockHeight,
  }: {
    tx: anchor.web3.Transaction;
    payerPubkey: anchor.web3.PublicKey;
    payer: anchor.web3.Keypair;
    blockhashWithExpiryBlockHeight: anchor.web3.BlockhashWithExpiryBlockHeight;
  }) {
    tx.recentBlockhash = blockhashWithExpiryBlockHeight.blockhash;
    // tx.lastValidBlockHeight = blockhashWithExpiryBlockHeight.lastValidBlockHeight;
    tx.feePayer = payerPubkey;
    tx.partialSign(payer);
    return serializeTx({ tx, requireAllSignatures: false });
  }

  private async finalizePrompt({
    tx: serializedTx,
    prompt,
    metadata,
    promptsVerifier,
    ixName,
    ixPayerAccountName,
    blockhashWithExpiryBlockHeight,
    commitment,
    confirmTx = true,
  }: {
    tx: string;
    ixName: string;
    ixPayerAccountName: string;
    prompt: string;
    metadata: string;
    promptsVerifier: anchor.web3.Keypair;
    blockhashWithExpiryBlockHeight: anchor.web3.BlockhashWithExpiryBlockHeight;
    commitment?: anchor.web3.Commitment;
    confirmTx?: boolean;
  }) {
    const tx = deserializeTx(serializedTx);

    // Verify transaction hasn't been modified
    if (!tx.verifySignatures(false)) {
      throw new Error('Transaction signatures invalid');
    }

    const parsedTx = await this.parseLocalTx<{
      promptHash: number[];
      metadataHash: number[];
    }>({ tx, ixName });

    if (!parsedTx) {
      throw new Error(`Invalid ix name: ${ixName}`);
    }
    // Verify prompt hash
    const providedPromptHash = parsedTx.data.promptHash;
    if (!providedPromptHash) {
      throw new Error('Prompt hash not found');
    }
    const promptHash = await hashText(prompt);
    if (!promptHash.every((byte, i) => byte === providedPromptHash[i])) {
      throw new Error('Content hash mismatch');
    }

    // validate metadata hash
    const providedMetadataHash = parsedTx.data.metadataHash;
    if (!providedMetadataHash) {
      throw new Error('Metadata hash not found');
    }
    const metadataHash = await hashText(metadata);
    if (!metadataHash.every((byte, i) => byte === providedMetadataHash[i])) {
      throw new Error('Content hash mismatch');
    }

    // Verify fee payer is the user
    const feePayer = parsedTx?.namedAccounts[ixPayerAccountName];
    if (!feePayer) {
      throw new Error('Fee payer not found');
    }
    if (!tx.feePayer?.equals(feePayer)) {
      throw new Error('Fee payer must be the user');
    }

    // Store proposal content
    await this.storeMessage({
      content: prompt,
      hash: promptHash,
    });

    // Store metadata
    await this.storeMessage({
      content: metadata,
      hash: metadataHash,
    });

    tx.partialSign(promptsVerifier);
    const signature = await this.program.provider.connection.sendRawTransaction(
      tx.serialize()
    );
    if (confirmTx) {
      await this.confirmTx({
        signature,
        blockhashWithExpiryBlockHeight,
        commitment,
      });
    }
    return signature;
  }

  async getCurrentFee({
    puzzlePDA,
  }: {
    puzzlePDA: anchor.web3.PublicKey;
  }): Promise<anchor.BN> {
    const puzzle = await this.getPuzzle(puzzlePDA);
    return this.program.methods
      .getCurrentFee(new anchor.BN(puzzle.nonce))
      .accountsStrict({
        puzzle: puzzlePDA,
        creator: puzzle.creator,
      })
      .view({
        commitment: COMMITMENT,
      });
  }

  async getGame() {
    return this.program.account.game.fetch(this.gamePDA);
  }

  getRandomPuzzleNonce() {
    return Math.floor(Date.now() / 1000);
  }

  async getPuzzle(puzzlePDA: anchor.web3.PublicKey) {
    return this.program.account.puzzle.fetch(puzzlePDA);
  }

  async getPuzzleCurrencyByMint(mint: anchor.web3.PublicKey) {
    return this.getPuzzleCurrency(this.getPuzzleCurrencyPDA({ mint }));
  }

  async getPuzzleCurrency(pda: anchor.web3.PublicKey) {
    return this.program.account.puzzleCurrency.fetch(pda);
  }

  async confirmTx({
    signature,
    blockhashWithExpiryBlockHeight,
    commitment,
  }: {
    signature: string;
    blockhashWithExpiryBlockHeight: anchor.web3.BlockhashWithExpiryBlockHeight;
    commitment?: anchor.web3.Commitment;
  }) {
    await this.program.provider.connection.confirmTransaction(
      {
        blockhash: blockhashWithExpiryBlockHeight.blockhash,
        lastValidBlockHeight:
          blockhashWithExpiryBlockHeight.lastValidBlockHeight,
        signature,
      },
      commitment
    );
    await sleep(500);
  }

  getPuzzlePDA({
    creator,
    nonce,
  }: {
    creator: anchor.web3.PublicKey;
    nonce: number;
  }) {
    return this.getPDA([
      Buffer.from('puzzle'),
      creator.toBuffer(),
      new anchor.BN(nonce).toArrayLike(Buffer, 'le', 8),
    ]);
  }

  getPuzzleEscrowPDA({
    creator,
    nonce,
  }: {
    creator: anchor.web3.PublicKey;
    nonce: number;
  }) {
    return this.getPDA([
      Buffer.from('puzzle_escrow'),
      creator.toBuffer(),
      new anchor.BN(nonce).toArrayLike(Buffer, 'le', 8),
    ]);
  }

  getPuzzleCurrencyPDA({ mint }: { mint: anchor.web3.PublicKey }) {
    return this.getPDA([Buffer.from('puzzle_currency'), mint.toBuffer()]);
  }

  getPDA(seeds: (Buffer | Uint8Array)[]) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      seeds,
      this.program.programId
    )[0];
  }

  getMessageBuffer(hash: number[]) {
    return Buffer.from(hash).toString('base64');
  }

  async getMintDecimals(mint: anchor.web3.PublicKey) {
    if (this.getMintIsNative(mint)) {
      return 9;
    }
    const { decimals } = await getMint(
      this.program.provider.connection,
      mint,
      COMMITMENT
    );
    return decimals;
  }

  async getTokenAccountAddress(
    mint: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    return getAssociatedTokenAddress(mint, owner);
  }

  async getOrCreateTokenAccount(
    mint: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    payer: anchor.web3.Keypair
  ) {
    return getOrCreateAssociatedTokenAccount(
      this.program.provider.connection,
      payer,
      mint,
      owner
      //   async (tx) => {
      //     await this.addFeePayer({ tx, payer: payer.publicKey });
      //     const blockhashWithExpiryBlockHeight = await this.addRecentBlockhash({
      //       tx,
      //     });
      //     await this.addPriorityFeeIx({ tx });

      //     tx.sign(payer);

      //     const signature =
      //       await this.program.provider.connection.sendRawTransaction(
      //         tx.serialize()
      //       );
      //     await this.confirmTx({
      //       signature,
      //       blockhashWithExpiryBlockHeight,
      //       commitment: COMMITMENT,
      //     });
      //     console.log('created token account', signature);
      //     return signature;
      //   }
    );
  }

  async getTokenAccountBalanceByMintAndOwner(
    mint: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    const tokenAccountAddress = await this.getTokenAccountAddress(mint, owner);
    return await this.getTokenAccountBalance(tokenAccountAddress);
  }

  async getTokenAccountBalance(tokenAccountAddress: anchor.web3.PublicKey) {
    return (
      await this.program.provider.connection.getTokenAccountBalance(
        tokenAccountAddress
      )
    ).value.amount;
  }

  async addPriorityFeeIx({ tx }: { tx: anchor.web3.Transaction }) {
    if (!process.env.TESTING) {
      const priorityFeeEstimate =
        (await getPriorityFeeEstimateMicroLamports({
          connection: this.program.provider.connection,
          tx,
        })) || 1e3;
      const priorityFeeIx =
        anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: priorityFeeEstimate,
        });
      tx.instructions.unshift(priorityFeeIx);
    }
  }

  async addFeePayer({
    tx,
    payer,
  }: {
    tx: anchor.web3.Transaction;
    payer: anchor.web3.PublicKey;
  }) {
    tx.feePayer = payer;
  }

  async addRecentBlockhash({
    tx,
    commitment,
  }: {
    tx: anchor.web3.Transaction;
    commitment?: anchor.web3.Commitment;
  }) {
    const latestBlockhash =
      await this.program.provider.connection.getLatestBlockhash(commitment);
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
    return latestBlockhash;
  }

  async completeAndSendTx({
    tx,
    payer,
    commitment = COMMITMENT,
  }: {
    tx: anchor.web3.Transaction;
    payer: anchor.web3.Keypair;
    commitment?: anchor.web3.Commitment;
  }) {
    await this.addFeePayer({ tx, payer: payer.publicKey });
    const blockhashWithExpiryBlockHeight = await this.addRecentBlockhash({
      tx,
    });
    await this.addPriorityFeeIx({ tx });

    tx.sign(payer);
    const signature = await this.program.provider.connection.sendRawTransaction(
      tx.serialize()
    );
    await this.confirmTx({
      signature,
      blockhashWithExpiryBlockHeight,
      commitment,
    });
    return signature;
  }

  async airdrop(publicKey: anchor.web3.PublicKey, amount: number) {
    const signature = await this.program.provider.connection.requestAirdrop(
      publicKey,
      toLamports(amount, 9).toNumber()
    );
    const blockhashWithExpiryBlockHeight =
      await this.program.provider.connection.getLatestBlockhash(COMMITMENT);
    await this.confirmTx({
      signature,
      blockhashWithExpiryBlockHeight,
    });
  }

  getMintIsNative(mint: anchor.web3.PublicKey) {
    return mint.equals(NATIVE_MINT);
  }
}
