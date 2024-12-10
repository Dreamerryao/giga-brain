use anchor_lang::prelude::*;

use crate::utils;

/// Represents the global game configuration
#[account]
pub struct Game {
    /// Authority that can update game parameters
    pub admin: Pubkey,
    /// Authority that can verify puzzle solutions
    pub puzzles_verifier: Pubkey,
    /// Authority that can verify agent system + user prompts
    pub prompts_verifier: Pubkey,
    /// Time window (in seconds) for regular puzzle attempts
    pub puzzle_attempt_timeout_seconds: u64,
    /// Time window (in seconds) for final puzzle attempt resolution
    pub puzzle_attempt_final_timeout_seconds: u64,
    /// Maximum number of attempts allowed per puzzle
    pub max_attempts: u32,
}

impl Game {
    pub const SEED: &'static str = "game";
}

/// Configuration for a supported puzzle currency
#[account]
pub struct PuzzleCurrency {
    /// The mint address of the token
    pub mint: Pubkey,
    /// Service fee in basis points (1/100th of a percent)
    pub service_fee_bps: u16,
    /// Minimum amount required for initial puzzle prize
    pub minimum_initial_prize: u64,
    /// Fee configuration for puzzle attempts
    pub fee_config: PuzzleFeeConfig,
}

impl PuzzleCurrency {
    pub const SEED: &'static str = "puzzle_currency";
}

/// Fee configuration for puzzle attempts
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PuzzleFeeConfig {
    /// Base fee for the first attempt
    pub base_fee: u64,
    /// Maximum fee cap for attempts
    pub max_fee: u64,
}

/// Represents an individual puzzle instance
#[account]
pub struct Puzzle {
    /// Unique identifier for the puzzle
    pub nonce: u64,
    /// The account that created this puzzle
    pub creator: Pubkey,
    /// Current status of the puzzle
    pub status: PuzzleStatus,
    /// Initial prize amount
    pub initial_prize: u64,
    /// Mint address of the currency used
    pub currency_mint: Pubkey,
    /// Service fee in basis points for this currency
    pub currency_service_fee_bps: u16,
    /// Base fee for attempts in this currency
    pub currency_base_fee: u64,
    /// Maximum fee cap for attempts in this currency
    pub currency_max_fee: u64,
    /// Maximum number of attempts allowed
    pub max_attempts: u32,
    /// Time window for regular attempts
    pub attempt_timeout_seconds: u64,
    /// Time window for final attempt resolution
    pub attempt_final_timeout_seconds: u64,
    /// Total number of attempts made
    pub total_attempts_made: u64,
    /// Hash of the puzzle prompt
    pub prompt_hash: [u8; 32],
    /// Hash of additional puzzle metadata
    pub metadata_hash: [u8; 32],
    /// Timestamp when final timer started
    pub final_timer_start_at: i64,
}

impl Puzzle {
    pub const SEED: &'static str = "puzzle";
    pub const ESCROW_SEED: &'static str = "puzzle_escrow";

    /// Calculates the fee for the next attempt based on current state
    ///
    /// Uses an exponential growth formula to increase fees as more attempts are made
    pub fn calculate_attempt_fee(&self) -> Result<u64> {
        Ok(utils::calculate_price(
            self.currency_base_fee,
            self.currency_max_fee,
            self.max_attempts,
            self.total_attempts_made,
        ))
    }
}

/// Represents the different states a puzzle can be in
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum PuzzleStatus {
    /// Puzzle is active and accepting attempts
    Active {
        /// Timestamp of last resolution
        last_resolved_at: i64,
    },
    /// Puzzle has been attempted and awaiting verification
    Attempted {
        /// Account that made the attempt
        solver: Pubkey,
        /// Hash of the attempted solution's prompt
        prompt_hash: [u8; 32],
        /// Hash of the attempted solution's metadata
        metadata_hash: [u8; 32],
        /// Timestamp of the attempt
        timestamp: i64,
    },
    /// Puzzle has timed out without successful resolution
    TimedOut,
    /// Puzzle solution has been approved and awaiting transfer
    ApprovedTransfer {
        /// Account that solved the puzzle
        solver: Pubkey,
        /// Timestamp when puzzle was solved
        solved_at: i64,
        /// Amount to be transferred to solver
        solver_share: u64,
        /// Amount to be transferred as service fee
        service_share: u64,
    },
    /// Puzzle has been completed and prizes distributed
    Completed,
}
