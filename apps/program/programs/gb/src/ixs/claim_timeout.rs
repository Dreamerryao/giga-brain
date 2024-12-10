use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::*;
use crate::error::ErrorCode;
use anchor_spl::token::{Mint, Token, TokenAccount};

/// Accounts required for a creator to claim SOL after puzzle timeout
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct CreatorClaimTimeout<'info> {
    /// The global game configuration account
    #[account(
        mut,
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = admin @ ErrorCode::InvalidAdmin
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account being claimed
    #[account(mut,
      seeds = [
        Puzzle::SEED.as_bytes(), 
        creator.key().as_ref(),
        &puzzle_nonce.to_le_bytes().as_ref()
      ],
      bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// The creator claiming the timeout funds
    #[account(mut)]
    pub creator: Signer<'info>,

    /// The escrow account holding the puzzle funds
    #[account(
        mut,
        seeds = [
            Puzzle::ESCROW_SEED.as_bytes(), 
            creator.key().as_ref(),
            &puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    /// The admin account that will receive service fees
    /// CHECK: Safe because this account is only used as a reference for PDA derivation and to receive fees
    #[account(mut)]
    pub admin: AccountInfo<'info>,

    /// The System Program
    pub system_program: Program<'info, System>,
}

/// Accounts required for an admin to claim SOL after puzzle timeout
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct AdminClaimTimeout<'info> {
    /// The global game configuration account
    #[account(
        mut,
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = admin @ ErrorCode::InvalidAdmin
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account being claimed
    #[account(mut,
      seeds = [
        Puzzle::SEED.as_bytes(), 
        creator.key().as_ref(),
        &puzzle_nonce.to_le_bytes().as_ref()
      ],
      bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// The creator of the puzzle
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    #[account(mut)]
    pub creator: AccountInfo<'info>,

    /// The escrow account holding the puzzle funds
    #[account(
        mut,
        seeds = [
            Puzzle::ESCROW_SEED.as_bytes(), 
            creator.key().as_ref(),
            &puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    /// The admin claiming the timeout funds
    #[account(mut)]
    pub admin: Signer<'info>,

    /// The System Program
    pub system_program: Program<'info, System>,
}

/// Accounts required for a creator to claim tokens after puzzle timeout
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct CreatorClaimTimeoutToken<'info> {
    /// The global game configuration account
    #[account(
        mut,
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = admin @ ErrorCode::InvalidAdmin
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account being claimed
    #[account(mut,
      seeds = [
        Puzzle::SEED.as_bytes(), 
        creator.key().as_ref(),
        &puzzle_nonce.to_le_bytes().as_ref()
      ],
      bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// The creator claiming the timeout funds
    #[account(mut)]
    pub creator: Signer<'info>,

    /// The admin account that will receive service fees
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub admin: AccountInfo<'info>,

    /// The creator's token account to receive funds
    #[account(mut,
        constraint = creator_token.mint == mint.key() @ ErrorCode::InvalidMint,
        constraint = creator_token.owner == creator.key() @ ErrorCode::InvalidTokenOwner,
    )]
    pub creator_token: Box<Account<'info, TokenAccount>>,
    
    /// The admin's token account to receive service fees
    #[account(mut,
        constraint = admin_token.mint == mint.key() @ ErrorCode::InvalidMint,
        constraint = admin_token.owner == admin.key() @ ErrorCode::InvalidTokenOwner,
    )]
    pub admin_token: Box<Account<'info, TokenAccount>>,

    /// The escrow token account holding the puzzle funds
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

    /// The configuration for the puzzle currency
    #[account(
        seeds = [PuzzleCurrency::SEED.as_bytes(), mint.key().as_ref()],
        bump,
    )]
    pub puzzle_currency: Box<Account<'info, PuzzleCurrency>>,

    /// The mint of the token being claimed
    #[account(
        constraint = mint.key() == puzzle_currency.mint @ ErrorCode::InvalidMint
    )]
    pub mint: Box<Account<'info, Mint>>,

    /// The Token Program
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    /// The System Program
    pub system_program: Program<'info, System>,

    /// The Rent Sysvar
    rent: Sysvar<'info, Rent>,
}

/// Accounts required for an admin to claim tokens after puzzle timeout
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct AdminClaimTimeoutToken<'info> {
    /// The global game configuration account
    #[account(
        mut,
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = admin @ ErrorCode::InvalidAdmin
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account being claimed
    #[account(mut,
      seeds = [
        Puzzle::SEED.as_bytes(), 
        creator.key().as_ref(),
        &puzzle_nonce.to_le_bytes().as_ref()
      ],
      bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// The configuration for the puzzle currency
    #[account(
        seeds = [PuzzleCurrency::SEED.as_bytes(), mint.key().as_ref()],
        bump,
    )]
    pub puzzle_currency: Box<Account<'info, PuzzleCurrency>>,

    /// The mint of the token being claimed
    #[account(
        constraint = mint.key() == puzzle_currency.mint @ ErrorCode::InvalidMint
    )]
    pub mint: Box<Account<'info, Mint>>,

    /// The creator of the puzzle
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    #[account(mut)]
    pub creator: AccountInfo<'info>,

    /// The creator's token account to receive funds
    #[account(mut,
        constraint = creator_token.mint == mint.key() @ ErrorCode::InvalidMint,
        constraint = creator_token.owner == creator.key() @ ErrorCode::InvalidTokenOwner,
    )]
    pub creator_token: Account<'info,  
    TokenAccount>,
    
    /// The admin's token account to receive service fees
    #[account(mut,
        constraint = admin_token.mint == mint.key() @ ErrorCode::InvalidMint,
        constraint = admin_token.owner == admin.key() @ ErrorCode::InvalidTokenOwner,
    )]
    pub admin_token: Account<'info,  
    TokenAccount>,

    /// The escrow token account holding the puzzle funds
    #[account(
        mut,
        seeds = [
            Puzzle::ESCROW_SEED.as_bytes(), creator.key().as_ref(), &puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump,
        token::mint = mint,
        token::authority = escrow_token,
    )]
    pub escrow_token: Account<'info, TokenAccount>,

    /// The admin claiming the timeout funds
    pub admin: Signer<'info>,

    /// The Token Program
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    /// The System Program
    pub system_program: Program<'info, System>,

    /// The Rent Sysvar
    rent: Sysvar<'info, Rent>,
}

/// Processes a creator's claim for SOL after puzzle timeout
pub fn creator_claim_timeout(ctx: Context<CreatorClaimTimeout>, _puzzle_nonce: u64) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let admin = &mut ctx.accounts.admin;
    let creator = &mut ctx.accounts.creator.to_account_info();
    let escrow = &mut ctx.accounts.escrow.to_account_info();
    let system_program = &mut ctx.accounts.system_program;
    let escrow_bump = ctx.bumps.escrow;
    let clock = Clock::get()?;

    claim_timeout(puzzle, escrow, escrow_bump, admin, creator, &clock, system_program)?;

    Ok(())
}

/// Processes an admin's claim for SOL after puzzle timeout
pub fn admin_claim_timeout(ctx: Context<AdminClaimTimeout>, _puzzle_nonce: u64) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let admin = &mut ctx.accounts.admin.to_account_info();
    let creator = &mut ctx.accounts.creator;
    let escrow = &mut ctx.accounts.escrow.to_account_info();
    let system_program = &mut ctx.accounts.system_program;
    let escrow_bump = ctx.bumps.escrow;
    let clock = Clock::get()?;

    claim_timeout(puzzle, escrow, escrow_bump, admin, creator, &clock, system_program)?;

    Ok(())
}

/// Processes a creator's claim for tokens after puzzle timeout
pub fn creator_claim_timeout_token(ctx: Context<CreatorClaimTimeoutToken>, _puzzle_nonce: u64) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let admin_token = &mut ctx.accounts.admin_token;
    let creator_token = &mut ctx.accounts.creator_token;
    let escrow_token = &mut ctx.accounts.escrow_token;
    let token_program = &mut ctx.accounts.token_program;
    let escrow_bump = ctx.bumps.escrow_token;
    let clock = Clock::get()?;

    claim_timeout_token(puzzle, escrow_token, escrow_bump, admin_token, creator_token, &clock, token_program)?;

    Ok(())
}

/// Processes an admin's claim for tokens after puzzle timeout
pub fn admin_claim_timeout_token(ctx: Context<AdminClaimTimeoutToken>, _puzzle_nonce: u64) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let admin_token = &mut ctx.accounts.admin_token;
    let creator_token = &mut ctx.accounts.creator_token;
    let escrow_token = &mut ctx.accounts.escrow_token;
    let token_program = &mut ctx.accounts.token_program;
    let escrow_bump = ctx.bumps.escrow_token;
    let clock = Clock::get()?;

    claim_timeout_token(puzzle, escrow_token, escrow_bump, admin_token, creator_token, &clock, token_program)?;

    Ok(())
}

/// Core logic for processing a timeout claim for SOL
/// 
/// # Arguments
/// * `puzzle` - The puzzle account being claimed
/// * `escrow` - The escrow account holding the funds
/// * `escrow_bump` - The PDA bump for the escrow account
/// * `admin` - The admin account to receive fees
/// * `creator` - The creator account to receive funds
/// * `clock` - The current Solana clock
/// * `system_program` - The System Program account
///
/// # Returns
/// * `Result<()>` - Result indicating success or failure of the claim
pub fn claim_timeout<'info>(
    puzzle: &mut Account<'info, Puzzle>,
    escrow: &mut AccountInfo<'info>,
    escrow_bump: u8,
    admin: &mut AccountInfo<'info>,
    creator: &mut AccountInfo<'info>,
    clock: &Clock,
    system_program: &AccountInfo<'info>,
) -> Result<()> {
    let puzzle_key = puzzle.key();

    let escrow_balance_before = escrow.get_lamports();
    let admin_balance_before = admin.get_lamports();
    let creator_balance_before = creator.get_lamports();

    let (creator_share, service_share) = update_timeout_puzzle(
        puzzle,
        clock,
        escrow_balance_before,
        puzzle_key,
    )?;

    // Transfer creator's share
    defund_puzzle_escrow(
        puzzle,
        system_program,
        creator,
        escrow,
        escrow_bump,
        creator_share,
    )?;

    // Transfer admin's share
    defund_puzzle_escrow(
        puzzle,
        system_program,
        admin,
        escrow,
        escrow_bump,
        service_share,
    )?;

    // Verify final balances
    let escrow_balance_after = escrow.get_lamports();
    let admin_balance_after = admin.get_lamports();
    let creator_balance_after = creator.get_lamports();

    require_eq!(escrow_balance_after, 0);
    require_eq!(admin_balance_after, admin_balance_before + service_share);
    require_eq!(
        creator_balance_after,
        creator_balance_before + creator_share
    );

    Ok(())
}

/// Core logic for processing a timeout claim for tokens
/// 
/// Similar to claim_timeout but handles token transfers instead of SOL
pub fn claim_timeout_token<'info>(
    puzzle: &mut Account<'info, Puzzle>,
    escrow_token: &mut Account<'info, TokenAccount>,
    escrow_bump: u8,
    admin_token: &mut Account<'info, TokenAccount>,
    creator_token: &mut Account<'info, TokenAccount>,
    clock: &Clock,
    token_program: &AccountInfo<'info>,
) -> Result<()> {
    let puzzle_key = puzzle.key();

    let escrow_balance_before = escrow_token.amount;
    let admin_balance_before = admin_token.amount;
    let creator_balance_before = creator_token.amount;

    let (creator_share, service_share) = update_timeout_puzzle(
        puzzle,
        clock,
        escrow_balance_before,
        puzzle_key,
    )?;

    // Transfer creator's share
    defund_puzzle_escrow_token(
        puzzle,
        token_program,
        creator_token,
        escrow_token,
        escrow_bump,
        creator_share,
    )?;

    // Transfer admin's share
    defund_puzzle_escrow_token(
        puzzle,
        token_program,
        admin_token,
        escrow_token,
        escrow_bump,
        service_share,
    )?;

    // Reload token accounts and verify final balances
    escrow_token.reload()?;
    admin_token.reload()?;
    creator_token.reload()?;

    let escrow_balance_after = escrow_token.amount;
    let admin_balance_after = admin_token.amount;
    let creator_balance_after = creator_token.amount;

    require_eq!(escrow_balance_after, 0);
    require_eq!(admin_balance_after, admin_balance_before + service_share);
    require_eq!(
        creator_balance_after,
        creator_balance_before + creator_share
    );

    Ok(())
}

/// Updates the puzzle status and calculates shares for timeout claims
/// 
/// # Arguments
/// * `puzzle` - The puzzle account to update
/// * `clock` - The current Solana clock
/// * `escrow_balance_before` - The initial balance in the escrow
/// * `puzzle_key` - The public key of the puzzle account
///
/// # Returns
/// * `Result<(u64, u64)>` - Tuple of (creator_share, service_share)
fn update_timeout_puzzle<'info>(
    puzzle: &mut Account<'info, Puzzle>,
    clock: &Clock,
    escrow_balance_before: u64,
    puzzle_key: Pubkey,
) -> Result<(u64, u64)> {
    // Verify puzzle is active and in final or normal timer
    if let PuzzleStatus::Active { last_resolved_at } = puzzle.status {
        // Verify puzzle has attempts and has timed out
        require!(puzzle.total_attempts_made > 0, ErrorCode::NoPuzzleAttempts);

        if puzzle.final_timer_start_at > 0 { // Final timer
            let time_since_final_timer_start = clock.unix_timestamp - puzzle.final_timer_start_at;
            require!(
                time_since_final_timer_start > puzzle.attempt_final_timeout_seconds as i64,
                ErrorCode::PuzzleStillInFinalTimer
            );
        } else { // Normal timer
            let time_since_last_attempt = clock.unix_timestamp - last_resolved_at;
            require!(
                time_since_last_attempt > puzzle.attempt_timeout_seconds as i64,
                ErrorCode::PuzzleStillActive
            );
        }
    } else {
        return Err(ErrorCode::PuzzleNotTimedOut.into());
    }

    // Mark puzzle as timed out
    puzzle.status = PuzzleStatus::TimedOut;

    // Calculate shares
    let total_prize = escrow_balance_before;
    let initial_prize = puzzle.initial_prize;
    let fees = total_prize - initial_prize;

    let service_share = fees
        .checked_mul(puzzle.currency_service_fee_bps.into())
        .unwrap()
        .checked_div(10000)
        .unwrap();
    let creator_fees_share = fees - service_share;
    let creator_share = creator_fees_share + initial_prize;

    emit!(PuzzleTimedOut {
        puzzle: puzzle_key,
        creator_share,
        service_share,
    });

    require!(creator_share + service_share == escrow_balance_before, ErrorCode::InvalidFeeCalculation);

    Ok((creator_share, service_share))
}

/// Event emitted when a puzzle times out
#[event]
pub struct PuzzleTimedOut {
    /// The public key of the timed out puzzle
    pub puzzle: Pubkey,
    /// Amount returned to the creator
    pub creator_share: u64,
    /// Amount taken as service fee
    pub service_share: u64,
}
