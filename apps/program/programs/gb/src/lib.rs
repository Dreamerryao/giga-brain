use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod ixs;
pub mod state;
pub mod utils;
use crate::ixs::*;

declare_id!("CzwhX7PRyfdk8xGw2Wo4G8e7JtwQcatd42Do7AW5Fk2c");

/// Main program module for the GB protocol
#[program]
pub mod gb {
    use super::*;

    /// Initializes the game configuration with initial parameters
    ///
    /// # Arguments
    /// * `ctx` - The context of accounts required for initialization
    /// * `args` - Initial game configuration parameters
    pub fn initialize(ctx: Context<Initialize>, args: GameConfigArgs) -> Result<()> {
        ixs::set_game_config(
            &mut ctx.accounts.game,
            ctx.accounts.puzzles_verifier.key(),
            ctx.accounts.prompts_verifier.key(),
            args,
        )?;
        ctx.accounts.game.admin = ctx.accounts.admin.key();
        Ok(())
    }

    /// Updates the game configuration parameters
    pub fn set_game_config(ctx: Context<SetGameConfig>, args: GameConfigArgs) -> Result<()> {
        ixs::set_game_config(
            &mut ctx.accounts.game,
            ctx.accounts.puzzles_verifier.key(),
            ctx.accounts.prompts_verifier.key(),
            args,
        )
    }

    /// Transfers admin rights to a new account
    pub fn transfer_admin(ctx: Context<TransferAdmin>) -> Result<()> {
        ixs::transfer_admin(ctx)
    }

    /// Creates a new puzzle currency configuration
    pub fn create_puzzle_currency_config(
        ctx: Context<CreatePuzzleCurrencyConfig>,
        args: PuzzleCurrencyConfigArgs,
    ) -> Result<()> {
        ixs::create_puzzle_currency_config(&mut ctx.accounts.puzzle_currency, args)
    }

    /// Updates an existing puzzle currency configuration
    pub fn set_puzzle_currency_config(
        ctx: Context<SetPuzzleCurrencyConfig>,
        args: PuzzleCurrencyConfigArgs,
    ) -> Result<()> {
        ixs::set_puzzle_currency_config(&mut ctx.accounts.puzzle_currency, args)
    }

    /// Creates a new puzzle with native SOL as currency
    ///
    /// # Arguments
    /// * `puzzle_nonce` - Unique identifier for the puzzle
    /// * `prompt_hash` - Hash of the puzzle prompt
    /// * `prize_amount` - Amount of SOL to be awarded
    /// * `name` - Name of the puzzle
    /// * `avatar_url` - URL to puzzle avatar
    /// * `model` - Model identifier
    /// * `metadata_hash` - Hash of additional puzzle metadata
    /// * `max_attempts` - Maximum number of attempts allowed
    /// * `base_fee` - Initial fee for first attempt
    /// * `max_fee` - Maximum fee cap for attempts
    /// * `attempt_timeout_seconds` - Time window for regular attempts
    /// * `attempt_final_timeout_seconds` - Time window for final attempt resolution
    pub fn create_puzzle(
        ctx: Context<CreatePuzzle>,
        puzzle_nonce: u64,
        prompt_hash: [u8; 32],
        prize_amount: u64,
        name: String,
        avatar_url: String,
        model: String,
        metadata_hash: [u8; 32],
        max_attempts: u32,
        base_fee: u64,
        max_fee: u64,
        attempt_timeout_seconds: u64,
        attempt_final_timeout_seconds: u64,
    ) -> Result<()> {
        ixs::create_puzzle(
            ctx,
            puzzle_nonce,
            prompt_hash,
            prize_amount,
            name,
            avatar_url,
            model,
            metadata_hash,
            max_attempts,
            base_fee,
            max_fee,
            attempt_timeout_seconds,
            attempt_final_timeout_seconds,
        )
    }

    /// Creates a new puzzle with SPL tokens as currency
    pub fn create_puzzle_token(
        ctx: Context<CreatePuzzleToken>,
        puzzle_nonce: u64,
        prompt_hash: [u8; 32],
        prize_amount: u64,
        name: String,
        avatar_url: String,
        model: String,
        metadata_hash: [u8; 32],
        max_attempts: u32,
        base_fee: u64,
        max_fee: u64,
        attempt_timeout_seconds: u64,
        attempt_final_timeout_seconds: u64,
    ) -> Result<()> {
        ixs::create_puzzle_token(
            ctx,
            puzzle_nonce,
            prompt_hash,
            prize_amount,
            name,
            avatar_url,
            model,
            metadata_hash,
            max_attempts,
            base_fee,
            max_fee,
            attempt_timeout_seconds,
            attempt_final_timeout_seconds,
        )
    }

    /// Records an attempt for a SOL-based puzzle
    pub fn record_attempt(
        ctx: Context<RecordAttempt>,
        puzzle_nonce: u64,
        prompt_hash: [u8; 32],
        max_fee: u64,
        metadata_hash: [u8; 32],
    ) -> Result<()> {
        ixs::record_attempt(ctx, puzzle_nonce, prompt_hash, max_fee, metadata_hash)
    }

    /// Records an attempt for a token-based puzzle
    pub fn record_attempt_token(
        ctx: Context<RecordAttemptToken>,
        puzzle_nonce: u64,
        prompt_hash: [u8; 32],
        max_fee: u64,
        metadata_hash: [u8; 32],
    ) -> Result<()> {
        ixs::record_attempt_token(ctx, puzzle_nonce, prompt_hash, max_fee, metadata_hash)
    }

    /// Retrieves the current attempt fee for a puzzle
    pub fn get_current_fee(ctx: Context<GetCurrentFee>, puzzle_nonce: u64) -> Result<u64> {
        ixs::get_current_fee(ctx, puzzle_nonce)
    }

    /// Approves a solution and initiates prize transfer for SOL-based puzzles
    pub fn approve_transfer(
        ctx: Context<ApprovedTransfer>,
        puzzle_nonce: u64,
        response_hash: [u8; 32],
    ) -> Result<()> {
        ixs::approve_transfer(ctx, puzzle_nonce, response_hash)
    }

    /// Approves a solution and initiates prize transfer for token-based puzzles
    pub fn approve_transfer_token(
        ctx: Context<ApprovedTransferToken>,
        puzzle_nonce: u64,
        response_hash: [u8; 32],
    ) -> Result<()> {
        ixs::approve_transfer_token(ctx, puzzle_nonce, response_hash)
    }

    /// Rejects an attempted solution
    pub fn reject_transfer(
        ctx: Context<RejectTransfer>,
        puzzle_nonce: u64,
        response_hash: [u8; 32],
    ) -> Result<()> {
        ixs::reject_transfer(ctx, puzzle_nonce, response_hash)
    }

    /// Claims the prize for a solved SOL-based puzzle
    pub fn claim_prize(ctx: Context<ClaimPrize>, puzzle_nonce: u64) -> Result<()> {
        ixs::claim_prize(ctx, puzzle_nonce)
    }

    /// Claims the prize for a solved token-based puzzle
    pub fn claim_prize_token(ctx: Context<ClaimPrizeToken>, puzzle_nonce: u64) -> Result<()> {
        ixs::claim_prize_token(ctx, puzzle_nonce)
    }

    /// Allows creator to claim funds after timeout for SOL-based puzzles
    pub fn creator_claim_timeout(
        ctx: Context<CreatorClaimTimeout>,
        puzzle_nonce: u64,
    ) -> Result<()> {
        ixs::creator_claim_timeout(ctx, puzzle_nonce)
    }

    /// Allows creator to claim funds after timeout for token-based puzzles
    pub fn creator_claim_timeout_token(
        ctx: Context<CreatorClaimTimeoutToken>,
        puzzle_nonce: u64,
    ) -> Result<()> {
        ixs::creator_claim_timeout_token(ctx, puzzle_nonce)
    }

    /// Allows admin to claim funds after timeout for SOL-based puzzles
    pub fn admin_claim_timeout(ctx: Context<AdminClaimTimeout>, puzzle_nonce: u64) -> Result<()> {
        ixs::admin_claim_timeout(ctx, puzzle_nonce)
    }

    /// Allows admin to claim funds after timeout for token-based puzzles
    pub fn admin_claim_timeout_token(
        ctx: Context<AdminClaimTimeoutToken>,
        puzzle_nonce: u64,
    ) -> Result<()> {
        ixs::admin_claim_timeout_token(ctx, puzzle_nonce)
    }
}
