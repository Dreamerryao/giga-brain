use anchor_lang::prelude::*;
use crate::state::*;
use crate::utils::*;
use crate::error::ErrorCode;
use anchor_spl::token::{Mint, Token, TokenAccount};

/// Accounts required for approving a transfer of SOL prizes
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct ApprovedTransfer<'info> {
    /// The global game configuration account
    #[account(
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = puzzles_verifier @ ErrorCode::InvalidVerifier,
        has_one = admin @ ErrorCode::InvalidAdmin,
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account being approved for transfer
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

    /// The admin account that will receive service fees
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    #[account(mut)]
    pub admin: SystemAccount<'info>,

    /// The verifier authorized to approve solutions
    pub puzzles_verifier: Signer<'info>,

    /// The System Program
    pub system_program: Program<'info, System>,
}

/// Approves a puzzle solution and transfers SOL prizes
/// 
/// # Arguments
/// * `ctx` - The context of accounts required for the transfer
/// * `_puzzle_nonce` - The unique identifier of the puzzle
/// * `_response_hash` - The hash of the verification response
///
/// # Returns
/// * `Result<()>` - Result indicating success or failure of the transfer
pub fn approve_transfer(
    ctx: Context<ApprovedTransfer>,
    _puzzle_nonce: u64,
    _response_hash: [u8; 32]
) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let admin = &mut ctx.accounts.admin;
    let puzzle_key = puzzle.key();
    let total_prize = ctx.accounts.escrow.get_lamports();
    let service_share = update_puzzle_status(puzzle, total_prize, puzzle_key)?;

    defund_puzzle_escrow(   
        puzzle,
        &ctx.accounts.system_program, 
        &mut admin.to_account_info(), 
        &mut ctx.accounts.escrow.to_account_info(), 
        ctx.bumps.escrow, 
        service_share
    )?;

    Ok(())
} 

/// Accounts required for approving a transfer of token prizes
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct ApprovedTransferToken<'info> {
    /// The global game configuration account
    #[account(
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = puzzles_verifier @ ErrorCode::InvalidVerifier,
        has_one = admin @ ErrorCode::InvalidAdmin,
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account being approved for transfer
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
    pub creator: AccountInfo<'info>,

    /// The mint of the token being used for prizes
    #[account(
        constraint = mint.key() == puzzle_currency.mint @ ErrorCode::InvalidMint
    )]
    pub mint: Box<Account<'info, Mint>>,

    /// The configuration for the puzzle currency
    #[account(
        seeds = [PuzzleCurrency::SEED.as_bytes(), mint.key().as_ref()],
        bump,
    )]
    pub puzzle_currency: Box<Account<'info, PuzzleCurrency>>,

    /// The escrow token account holding the prize funds
    #[account(
        mut,
        seeds = [
            Puzzle::ESCROW_SEED.as_bytes(), 
            creator.key().as_ref(), 
            &puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump,
        token::mint = mint,
        token::authority = escrow_token,
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    /// The admin's token account to receive service fees
    #[account(mut,
        constraint = admin_token.mint == mint.key() @ ErrorCode::InvalidMint,
        constraint = admin_token.owner == admin.key() @ ErrorCode::InvalidAdmin,
    )]
    pub admin_token: Box<Account<'info, TokenAccount>>,

    /// The admin account
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub admin: AccountInfo<'info>,

    /// The Token Program
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    /// The verifier authorized to approve solutions
    pub puzzles_verifier: Signer<'info>,

    /// The System Program
    pub system_program: Program<'info, System>,

    /// The Rent Sysvar
    rent: Sysvar<'info, Rent>,
}

/// Approves a puzzle solution and transfers token prizes
/// 
/// # Arguments
/// * `ctx` - The context of accounts required for the transfer
/// * `_puzzle_nonce` - The unique identifier of the puzzle
/// * `_response_hash` - The hash of the verification response
///
/// # Returns
/// * `Result<()>` - Result indicating success or failure of the transfer
pub fn approve_transfer_token(
    ctx: Context<ApprovedTransferToken>,
    _puzzle_nonce: u64,
    _response_hash: [u8; 32]
) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let admin_token = &mut ctx.accounts.admin_token;
    let puzzle_key = puzzle.key();
    let total_prize = ctx.accounts.escrow_token.amount;
    let service_share = update_puzzle_status(puzzle, total_prize, puzzle_key)?;

    defund_puzzle_escrow_token(   
        puzzle,
        &ctx.accounts.token_program, 
        admin_token, 
        &mut ctx.accounts.escrow_token, 
        ctx.bumps.escrow_token, 
        service_share
    )?;

    Ok(())
} 

/// Updates the puzzle status after a successful solution verification
/// 
/// # Arguments
/// * `puzzle` - The puzzle account to update
/// * `total_prize` - The total prize amount available
/// * `puzzle_key` - The public key of the puzzle account
///
/// # Returns
/// * `Result<u64>` - The calculated service fee share
fn update_puzzle_status(puzzle: &mut Puzzle, total_prize: u64, puzzle_key: Pubkey) -> Result<u64> {  
    if let PuzzleStatus::Attempted{solver, timestamp, ..} = puzzle.status {
        let service_fee_bps = puzzle.currency_service_fee_bps;
        
        // Calculate solver's share
        let solver_share = total_prize
            .checked_mul(10000 - service_fee_bps as u64)
            .unwrap()
            .checked_div(10000)
            .unwrap();

        let service_share = total_prize - solver_share;

        puzzle.status = PuzzleStatus::ApprovedTransfer { 
            solver,
            solved_at: timestamp,
            solver_share,
            service_share,
        };

        emit!(PuzzleSolved {
            puzzle: puzzle_key,
            solved_at: timestamp,
            solver_share,
            service_share,
        });

        Ok(service_share)
    } else {
        Err(ErrorCode::PuzzleNotAttempted.into())
    }
}

/// Event emitted when a puzzle is successfully solved
#[event]
pub struct PuzzleSolved {
    /// The public key of the solved puzzle
    pub puzzle: Pubkey,
    /// Timestamp when the puzzle was solved
    pub solved_at: i64,
    /// Amount awarded to the solver
    pub solver_share: u64,
    /// Amount taken as service fee
    pub service_share: u64,
}