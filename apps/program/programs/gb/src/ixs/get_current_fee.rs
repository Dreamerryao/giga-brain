use anchor_lang::prelude::*;
use crate::state::*;

/// Accounts required for the `get_current_fee` instruction
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct GetCurrentFee<'info> {
    /// The puzzle account that stores attempt fee information
    /// Seeds: ["puzzle", creator, puzzle_nonce]
    #[account(
        seeds = [
            Puzzle::SEED.as_bytes(), 
            creator.key().as_ref(),
            &puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub puzzle: Account<'info, Puzzle>,

    /// The creator of the puzzle
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub creator: AccountInfo<'info>,
} 

/// Returns the current fee required to attempt solving the puzzle
/// @param ctx The context containing accounts
/// @param _puzzle_nonce The unique identifier for this puzzle
/// @return Result<u64> The current attempt fee in lamports
pub fn get_current_fee(ctx: Context<GetCurrentFee>, _puzzle_nonce: u64) -> Result<u64> {
    let puzzle = &ctx.accounts.puzzle;
    puzzle.calculate_attempt_fee()
}