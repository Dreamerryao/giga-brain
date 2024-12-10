use anchor_lang::prelude::*;
use crate::utils::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_spl::token::{Mint, Token, TokenAccount};

/// Accounts required for claiming a SOL prize
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct ClaimPrize<'info> {
    /// The global game configuration account
    #[account(
        seeds = [Game::SEED.as_bytes()],
        bump
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account containing prize information
    #[account(
        mut,
        seeds = [
          Puzzle::SEED.as_bytes(), 
          creator.key().as_ref(),
          &puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// The account claiming the prize (must be the verified solver)
    #[account(mut)]
    pub solver: Signer<'info>,

    /// The creator of the puzzle
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub creator: AccountInfo<'info>,

    /// The escrow account holding the prize funds
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

    /// The System Program
    pub system_program: Program<'info, System>,
}

/// Claims a SOL prize for a solved puzzle
/// 
/// # Arguments
/// * `ctx` - The context of accounts required for the claim
/// * `_puzzle_nonce` - The unique identifier of the puzzle
///
/// # Returns
/// * `Result<()>` - Result indicating success or failure of the claim
pub fn claim_prize(ctx: Context<ClaimPrize>, _puzzle_nonce: u64) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let solver = &mut ctx.accounts.solver;
    
    let solver_share = update_puzzle_status(puzzle, solver.key())?;

    defund_puzzle_escrow(
        puzzle,
        &ctx.accounts.system_program, 
        &mut ctx.accounts.solver.to_account_info(), 
        &mut ctx.accounts.escrow.to_account_info(), 
        ctx.bumps.escrow, 
        solver_share
    )?;

    Ok(())
}

/// Accounts required for claiming a token prize
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct ClaimPrizeToken<'info> {
    /// The global game configuration account
    #[account(
        seeds = [Game::SEED.as_bytes()],
        bump
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account containing prize information
    #[account(
        mut,
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

    /// The token account that will receive the prize
    #[account(mut,
        constraint = solver_token.mint == mint.key() @ ErrorCode::InvalidMint,
        constraint = solver_token.owner == solver.key() @ ErrorCode::InvalidTokenOwner,
    )]
    pub solver_token: Box<Account<'info, TokenAccount>>,

    /// The creator of the puzzle
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    pub creator: AccountInfo<'info>,

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

    /// The Token Program
    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    /// The account claiming the prize (must be the verified solver)
    #[account(mut)]
    pub solver: Signer<'info>,

    /// The System Program
    pub system_program: Program<'info, System>,

    /// The Rent Sysvar
    rent: Sysvar<'info, Rent>,
}

/// Claims a token prize for a solved puzzle
/// 
/// # Arguments
/// * `ctx` - The context of accounts required for the claim
/// * `_puzzle_nonce` - The unique identifier of the puzzle
///
/// # Returns
/// * `Result<()>` - Result indicating success or failure of the claim
pub fn claim_prize_token(ctx: Context<ClaimPrizeToken>, _puzzle_nonce: u64) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;

    let solver_share = update_puzzle_status(puzzle, ctx.accounts.solver.key())?;

    defund_puzzle_escrow_token(
        puzzle,
        &ctx.accounts.token_program, 
        &mut ctx.accounts.solver_token,
        &mut ctx.accounts.escrow_token,  
        ctx.bumps.escrow_token, 
        solver_share
    )?;

    Ok(())
}

/// Updates the puzzle status and verifies the solver
/// 
/// # Arguments
/// * `puzzle` - The puzzle account to update
/// * `s` - The public key of the solver claiming the prize
///
/// # Returns
/// * `Result<u64>` - The amount to be transferred to the solver
fn update_puzzle_status(puzzle: &mut Puzzle, s: Pubkey) -> Result<u64> {  
    if let PuzzleStatus::ApprovedTransfer { solver, solver_share, .. } = puzzle.status {
        require!(
            solver == s.key(),
            ErrorCode::InvalidPuzzleSolver
        );

        // Mark puzzle as completed
        puzzle.status = PuzzleStatus::Completed;

        Ok(solver_share)
    } else {
        return Err(ErrorCode::PuzzleTransferNotApproved.into());
    }
}