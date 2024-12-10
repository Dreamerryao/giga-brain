use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

/// Configuration parameters for the game settings
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GameConfigArgs {
    /// Time limit (in seconds) for regular puzzle attempts
    pub puzzle_attempt_timeout_seconds: u64,
    /// Time limit (in seconds) for final puzzle attempts
    pub puzzle_attempt_final_timeout_seconds: u64,
    /// Maximum number of attempts allowed per puzzle
    pub max_attempts: u32,
}

/// Accounts required for initializing the game configuration
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init_if_needed,
        space = 8 + std::mem::size_of::<Game>(),
        payer = admin,
        seeds = [Game::SEED.as_bytes()],
        bump,
    )]
    pub game: Box<Account<'info, Game>>,

    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub puzzles_verifier: AccountInfo<'info>,

    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub prompts_verifier: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Accounts required for updating the game configuration
/// Only the admin can modify these settings
#[derive(Accounts)]
pub struct SetGameConfig<'info> {
    #[account(
        mut,
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = admin @ ErrorCode::InvalidAdmin
    )]
    pub game: Box<Account<'info, Game>>,

    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub puzzles_verifier: AccountInfo<'info>,

    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub prompts_verifier: AccountInfo<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Updates the game configuration with new settings
///
/// # Arguments
/// * `game` - Mutable reference to the game account
/// * `puzzles_verifier` - Public key of the account responsible for verifying puzzle solutions
/// * `prompts_verifier` - Public key of the account responsible for verifying prompt solutions
/// * `args` - New configuration parameters for the game
///
/// # Returns
/// * `Result<()>` - Success if the configuration is updated
pub fn set_game_config(
    game: &mut Account<Game>,
    puzzles_verifier: Pubkey,
    prompts_verifier: Pubkey,
    args: GameConfigArgs,
) -> Result<()> {
    game.puzzles_verifier = puzzles_verifier;
    game.prompts_verifier = prompts_verifier;
    game.puzzle_attempt_timeout_seconds = args.puzzle_attempt_timeout_seconds;
    game.puzzle_attempt_final_timeout_seconds = args.puzzle_attempt_final_timeout_seconds;
    game.max_attempts = args.max_attempts;
    Ok(())
}
