use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

/// Accounts required for rejecting a puzzle transfer attempt
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct RejectTransfer<'info> {
    /// The global game configuration account that stores the authorized puzzle verifier
    #[account(
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = puzzles_verifier @ ErrorCode::InvalidVerifier
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account being updated
    /// PDA derived from creator's address and puzzle nonce
    #[account(mut,
      seeds = [
        Puzzle::SEED.as_bytes(), 
        creator.key().as_ref(),
        &puzzle_nonce.to_le_bytes().as_ref()
      ],
      bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// The original creator of the puzzle
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub creator: AccountInfo<'info>,

    /// The authorized verifier who can approve/reject puzzle attempts
    pub puzzles_verifier: Signer<'info>,
}

/// Instruction handler to reject a puzzle transfer attempt
/// 
/// This instruction allows the authorized puzzle verifier to reject an attempted puzzle solution.
/// If max attempts have been reached, it will start the final timer.
///
/// # Arguments
/// * `ctx` - The context of accounts
/// * `_puzzle_nonce` - Unique identifier for the puzzle (used in PDA derivation)
/// * `_prompt_hash` - Hash of the puzzle prompt (unused in this function but needed for account validation)
pub fn reject_transfer(
    ctx: Context<RejectTransfer>,
    _puzzle_nonce: u64,
    _prompt_hash: [u8; 32]
) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    require!(matches!(puzzle.status, PuzzleStatus::Attempted{..}), ErrorCode::PuzzleNotAttempted);

    let clock = Clock::get()?;
    let last_resolved_at = clock.unix_timestamp;
    let max_attempts = puzzle.max_attempts as u64;
    if puzzle.total_attempts_made == max_attempts { // Final timer if max attempts reached
        puzzle.final_timer_start_at = last_resolved_at;

        emit!(PuzzleFinalTimerStarted {
            puzzle: puzzle.key(),
            timestamp: last_resolved_at,
        });
    }

    puzzle.status = PuzzleStatus::Active {
        last_resolved_at: last_resolved_at,
    };

    emit!(PuzzleAttemptRejected {
        puzzle: puzzle.key(),
        timestamp: last_resolved_at,
    });

    Ok(())
} 

/// Event emitted when a puzzle attempt is rejected
#[event]
pub struct PuzzleAttemptRejected {
    pub puzzle: Pubkey,
    pub timestamp: i64,
}

/// Event emitted when the final timer starts after max attempts are reached
#[event]
pub struct PuzzleFinalTimerStarted {
    pub puzzle: Pubkey,
    pub timestamp: i64,
}