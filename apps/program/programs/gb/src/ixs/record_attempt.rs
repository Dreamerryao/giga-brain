use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_spl::token::{Mint, Token, TokenAccount};

/// Records a puzzle attempt using native SOL as payment
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct RecordAttempt<'info> {
    /// The puzzle account being attempted
    #[account(mut,
      seeds = [
        Puzzle::SEED.as_bytes(), 
        creator.key().as_ref(),
        &puzzle_nonce.to_le_bytes().as_ref()
      ],
      bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// The account attempting to solve the puzzle
    #[account(mut)]
    pub solver: Signer<'info>,

    /// Escrow account that holds attempt fees
    #[account(
        mut,
        seeds = [
            Puzzle::ESCROW_SEED.as_bytes(), 
            creator.key().as_ref(),
            puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub creator: AccountInfo<'info>,

    #[account(mut)]
    pub prompts_verifier: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn record_attempt(
    ctx: Context<RecordAttempt>, 
    _puzzle_nonce: u64,
    prompt_hash: [u8; 32],
    max_fee: u64,
    metadata_hash: [u8; 32]
) -> Result<()> {
    let clock = Clock::get()?;
    let puzzle = &mut ctx.accounts.puzzle;
    let puzzle_key = puzzle.key();
    
    let calculated_fee = update_puzzle_status(puzzle, puzzle_key, &ctx.accounts.solver, &clock, prompt_hash, metadata_hash, max_fee)?;

    let escrow = &mut ctx.accounts.escrow;
    let escrow_balance_before = escrow.get_lamports();
    let solver_balance_before = ctx.accounts.solver.get_lamports();

    // Transfer fee
    anchor_lang::system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.solver.to_account_info(),
                to: escrow.to_account_info(),
            },
        ),
        calculated_fee,
    )?;

    let escrow_balance_after = escrow.get_lamports();
    let solver_balance_after = ctx.accounts.solver.get_lamports();
    require_eq!(escrow_balance_after, escrow_balance_before + calculated_fee);
    require_eq!(solver_balance_after, solver_balance_before - calculated_fee);

    
    Ok(())
}


/// Records a puzzle attempt using SPL tokens as payment
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct RecordAttemptToken<'info> {
    /// The puzzle account being attempted
    #[account(mut,
      seeds = [
        Puzzle::SEED.as_bytes(), 
        creator.key().as_ref(),
        &puzzle_nonce.to_le_bytes().as_ref()
      ],
      bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// The account attempting to solve the puzzle
    #[account(mut)]
    pub solver: Signer<'info>,

    /// The creator of the puzzle
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub creator: AccountInfo<'info>,

    /// The token account of the solver containing the fee payment
    #[account(mut,
        constraint = solver_token.mint == mint.key() @ ErrorCode::InvalidMint,
        constraint = solver_token.owner == solver.key() @ ErrorCode::InvalidTokenOwner,
    )]
    pub solver_token: Box<Account<'info,  
    TokenAccount>>,

    /// The escrow token account that holds attempt fees
    #[account(
        mut,
        seeds = [
            Puzzle::ESCROW_SEED.as_bytes(), creator.key().as_ref(), &puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump,
        token::mint = mint,
        token::authority = escrow_token,
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    #[account(
        seeds = [PuzzleCurrency::SEED.as_bytes(), mint.key().as_ref()],
        bump,
    )]
    pub puzzle_currency: Box<Account<'info, PuzzleCurrency>>,

    #[account(
        constraint = mint.key() == puzzle_currency.mint @ ErrorCode::InvalidMint
    )]
    pub mint: Box<Account<'info, Mint>>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    #[account(mut)]
    pub prompts_verifier: Signer<'info>,

    pub system_program: Program<'info, System>,

    rent: Sysvar<'info, Rent>,
}

pub fn record_attempt_token(
    ctx: Context<RecordAttemptToken>, 
    _puzzle_nonce: u64,
    prompt_hash: [u8; 32],
    max_fee: u64,
    metadata_hash: [u8; 32]
) -> Result<()> {
    let clock = Clock::get()?;
    let puzzle = &mut ctx.accounts.puzzle;
    let puzzle_key = puzzle.key();
    let token_program = &ctx.accounts.token_program;
    
    let calculated_fee = update_puzzle_status(puzzle, puzzle_key, &ctx.accounts.solver, &clock, prompt_hash, metadata_hash, max_fee)?;

    let escrow_balance_before = ctx.accounts.escrow_token.amount;
    let solver_balance_before = ctx.accounts.solver_token.amount;

    // Transfer fee
    anchor_spl::token::transfer(
        CpiContext::new(
            token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.solver_token.to_account_info(),
                to: ctx.accounts.escrow_token.to_account_info(),
                authority: ctx.accounts.solver.to_account_info(),
            },
        ),
        calculated_fee,
    )?;

    ctx.accounts.solver_token.reload()?;
    ctx.accounts.escrow_token.reload()?;

    let escrow_balance_after = ctx.accounts.escrow_token.amount;
    let solver_balance_after = ctx.accounts.solver_token.amount;
    require_eq!(escrow_balance_after, escrow_balance_before + calculated_fee);
    require_eq!(solver_balance_after, solver_balance_before - calculated_fee);
    
    Ok(())
}


/// Updates the puzzle status and calculates attempt fee
/// 
/// # Arguments
/// * `puzzle` - Mutable reference to the puzzle account
/// * `puzzle_key` - Public key of the puzzle account
/// * `solver` - The account attempting to solve the puzzle
/// * `clock` - The current Solana clock
/// * `prompt_hash` - Hash of the prompt being submitted
/// * `metadata_hash` - Hash of any additional metadata
/// * `max_fee` - Maximum fee the solver is willing to pay
///
/// # Returns
/// * `Result<u64>` - The calculated attempt fee if successful
fn update_puzzle_status(puzzle: &mut Puzzle, puzzle_key: Pubkey, solver: &Signer, clock: &Clock,  prompt_hash: [u8; 32], metadata_hash: [u8; 32], max_fee: u64) -> Result<u64> {
    // Creator cannot record an attempt
    require!(
        puzzle.creator.key() != solver.key(),
        ErrorCode::InvalidSolver
    );
    
    // Verify puzzle is active and in final or normal timer
    if let PuzzleStatus::Active { last_resolved_at } = puzzle.status {
        if puzzle.final_timer_start_at > 0 { // Final timer
            let time_since_final_timer_start = clock.unix_timestamp - puzzle.final_timer_start_at;
            require!(
                time_since_final_timer_start <= puzzle.attempt_final_timeout_seconds as i64,
                ErrorCode::PuzzleFinalTimerTimedOut
            );
        } else if puzzle.total_attempts_made > 0 { // Normal timer
            let time_since_last_attempt = clock.unix_timestamp - last_resolved_at;
            require!(
                time_since_last_attempt <= puzzle.attempt_timeout_seconds as i64,
                ErrorCode::PuzzleTimedOut
            );
        }
    } else {
        if let PuzzleStatus::Attempted { .. } = puzzle.status {
            return Err(ErrorCode::PuzzleInAttemptedState.into());
        }
        return Err(ErrorCode::PuzzleNotActive.into());
    }

    // Calculate fee
    let calculated_fee = puzzle.calculate_attempt_fee()?;
    
    // Guard against price movement
    require!(
        calculated_fee <= max_fee,
        ErrorCode::MaxFeeExceeded
    );
 
    puzzle.total_attempts_made += 1;
    puzzle.status = PuzzleStatus::Attempted {
        solver: solver.key(),
        timestamp: clock.unix_timestamp,
        prompt_hash,
        metadata_hash,
    };

    emit!(PuzzleAttempted {
        puzzle: puzzle_key,
        fee: calculated_fee,
        timestamp: clock.unix_timestamp,
    });

    Ok(calculated_fee)
}

/// Event emitted when a puzzle attempt is recorded
#[event]
pub struct PuzzleAttempted {
    /// Public key of the puzzle being attempted
    pub puzzle: Pubkey,
    /// Fee paid for the attempt
    pub fee: u64,
    /// Timestamp of the attempt
    pub timestamp: i64,
}