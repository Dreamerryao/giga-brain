use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::*;
use crate::error::ErrorCode;

/// CreatePuzzle accounts struct - Used for creating puzzles with native SOL as the prize currency
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct CreatePuzzle<'info> {
    /// The global game configuration account
    #[account(
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = prompts_verifier @ ErrorCode::InvalidVerifier
    )]
    pub game: Box<Account<'info, Game>>,

    /// The puzzle account that will be initialized
    #[account(
        init,
        payer = creator,
        space = 8 + std::mem::size_of::<Puzzle>(),
        seeds = [
            Puzzle::SEED.as_bytes(), 
            creator.key().as_ref(),
            puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    /// Configuration for the puzzle's currency (SOL in this case)
    #[account(
        seeds = [PuzzleCurrency::SEED.as_bytes(), anchor_spl::token::spl_token::native_mint::ID.key().as_ref()],
        bump,
    )]
    pub puzzle_currency: Box<Account<'info, PuzzleCurrency>>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [
            Puzzle::ESCROW_SEED.as_bytes(), 
            creator.key().as_ref(),
            &puzzle_nonce.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub escrow: SystemAccount<'info>,

    #[account(mut)]
    pub prompts_verifier: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Creates a new puzzle using native SOL as the prize currency
pub fn create_puzzle(
    ctx: Context<CreatePuzzle>,  
    puzzle_nonce: u64,  
    prompt_hash: [u8; 32],
    prize_amount: u64,
    _name: String,
    _avatar_url: String,
    _model: String,
    metadata_hash: [u8; 32],
    max_attempts: u32,
    base_fee: u64,
    max_fee: u64,
    attempt_timeout_seconds: u64,
    attempt_final_timeout_seconds: u64,
) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let game = &ctx.accounts.game; 
    let system_program = &ctx.accounts.system_program;
    let puzzle_currency = &ctx.accounts.puzzle_currency;
    let minimum_initial_prize = puzzle_currency.minimum_initial_prize;

    require!(
        prize_amount >= minimum_initial_prize,
        ErrorCode::InsufficientPrize
    );

    let rent = Rent::get()?.minimum_balance(0); // Escrow account needs no data, just SOL
    let total_lamports_for_escow = rent + prize_amount;

    let creator_balance_before = ctx.accounts.creator.get_lamports();
    require!(
        creator_balance_before >= total_lamports_for_escow,
        ErrorCode::InsufficientFunds
    );

    anchor_lang::system_program::transfer(
        CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
            },
        ),
        total_lamports_for_escow,
    )?;
    
    let escrow_balance_after = ctx.accounts.escrow.get_lamports();
    let creator_balance_after = ctx.accounts.creator.get_lamports();
    require_eq!(escrow_balance_after, total_lamports_for_escow);
    require_eq!(creator_balance_after, creator_balance_before - total_lamports_for_escow);

    update_puzzle(puzzle, prize_amount, prompt_hash, puzzle_nonce, puzzle_currency, game, &ctx.accounts.creator, metadata_hash, max_attempts, base_fee, max_fee, attempt_timeout_seconds, attempt_final_timeout_seconds)?;

    Ok(())
}

/// CreatePuzzleToken accounts struct - Used for creating puzzles with SPL tokens as the prize currency
#[derive(Accounts)]
#[instruction(puzzle_nonce: u64)]
pub struct CreatePuzzleToken<'info> {
    #[account(
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = prompts_verifier @ ErrorCode::InvalidVerifier
    )]
    pub game: Box<Account<'info, Game>>,

    #[account(
        init,
        payer = creator,
        space = 8 + std::mem::size_of::<Puzzle>(),
        seeds = [
            Puzzle::SEED.as_bytes(), 
            creator.key().as_ref(),
            puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub puzzle: Box<Account<'info, Puzzle>>,

    #[account(
        seeds = [PuzzleCurrency::SEED.as_bytes(), mint.key().as_ref()],
        bump,
    )]
    pub puzzle_currency: Box<Account<'info, PuzzleCurrency>>,

    #[account(
        constraint = mint.key() == puzzle_currency.mint @ ErrorCode::InvalidMint
    )]
    pub mint: Box<Account<'info, Mint>>,
    
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut,
        constraint = creator_token.mint == mint.key() @ ErrorCode::InvalidMint,
        constraint = creator_token.owner == creator.key() @ ErrorCode::InvalidTokenOwner,
    )]
    pub creator_token: Box<Account<'info,  
    TokenAccount>>,

    #[account(
        init,
        payer = creator,
        seeds = [
            Puzzle::ESCROW_SEED.as_bytes(), creator.key().as_ref(), &puzzle_nonce.to_le_bytes().as_ref()
        ],
        bump,
        token::mint = mint,
        token::authority = escrow_token,
    )]
    pub escrow_token: Box<Account<'info, TokenAccount>>,

    #[account(address = anchor_spl::token::ID)]
    pub token_program: Program<'info, Token>,

    #[account(mut)]
    pub prompts_verifier: Signer<'info>,

    pub system_program: Program<'info, System>,

    rent: Sysvar<'info, Rent>,
}

/// Creates a new puzzle using an SPL token as the prize currency
pub fn create_puzzle_token(
    ctx: Context<CreatePuzzleToken>,  
    puzzle_nonce: u64,  
    prompt_hash: [u8; 32],
    prize_amount: u64,
    _name: String,
    _avatar_url: String,
    _model: String,
    metadata_hash: [u8; 32],
    max_attempts: u32,
    base_fee: u64,
    max_fee: u64,
    attempt_timeout_seconds: u64,
    attempt_final_timeout_seconds: u64,
) -> Result<()> {
    let puzzle = &mut ctx.accounts.puzzle;
    let game = &ctx.accounts.game;
    let puzzle_currency = &ctx.accounts.puzzle_currency;

    let creator = &ctx.accounts.creator;
    let token_program = &ctx.accounts.token_program;
    let minimum_initial_prize = puzzle_currency.minimum_initial_prize;

    require!(
        prize_amount >= minimum_initial_prize,
        ErrorCode::InsufficientPrize
    );

    // let rent = Rent::get()?.minimum_balance(0); // Escrow account needs no data, just SOL
    // require!(
    //     creator.lamports() >= rent,
    //     ErrorCode::InsufficientFunds
    // );

    let creator_balance_before = ctx.accounts.creator_token.amount;
    require!(
        creator_balance_before >= prize_amount,
        ErrorCode::InsufficientFunds
    );

    // anchor_lang::system_program::transfer(
    //     CpiContext::new(
    //         system_program.to_account_info(),
    //         anchor_lang::system_program::Transfer {
    //             from: creator.to_account_info(),
    //             to: escrow.to_account_info(),
    //         },
    //     ),
    //     rent,
    // )?;

    anchor_spl::token::transfer(
        CpiContext::new(
            token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.creator_token.to_account_info(),
                to: ctx.accounts.escrow_token.to_account_info(),
                authority: creator.to_account_info(),
            },
        ),
        prize_amount,
    )?;

    ctx.accounts.creator_token.reload()?;
    ctx.accounts.escrow_token.reload()?;

    let creator_balance_after = ctx.accounts.creator_token.amount;
    require_eq!(creator_balance_after, creator_balance_before - prize_amount);

    let escrow_balance_after = ctx.accounts.escrow_token.amount;
    require_eq!(escrow_balance_after, prize_amount);

    update_puzzle(puzzle, prize_amount, prompt_hash, puzzle_nonce, puzzle_currency, game, &ctx.accounts.creator, metadata_hash, max_attempts, base_fee, max_fee, attempt_timeout_seconds, attempt_final_timeout_seconds)?;

    Ok(())
}

/// Helper function to initialize puzzle state with common fields
/// Used by both SOL and SPL token puzzle creation
fn update_puzzle(
    puzzle: &mut Puzzle, 
    prize_amount: u64,
    prompt_hash: [u8; 32], 
    puzzle_nonce: u64, 
    puzzle_currency: &PuzzleCurrency, 
    game: &Game, creator: &Signer,
    metadata_hash: [u8; 32],
    max_attempts: u32, 
    base_fee: u64,
    max_fee: u64,
    attempt_timeout_seconds: u64,
    attempt_final_timeout_seconds: u64,
) -> Result<()> {
    // Validate puzzle parameters against game config
    let min_max_attempts = game.max_attempts;
    let min_base_fee = puzzle_currency.fee_config.base_fee;
    let max_max_fee = puzzle_currency.fee_config.max_fee;
    
    // Validate attempt limits
    require!(
        max_attempts >= min_max_attempts,
        ErrorCode::InvalidMaxAttempts
    );
    
    // Validate fee configuration
    require!(
        base_fee >= min_base_fee, 
        ErrorCode::InvalidBaseFee
    );
    require!(
        max_fee <= max_max_fee,
        ErrorCode::InvalidMaxFee
    );
    require!(
        base_fee < max_fee,
        ErrorCode::InvalidBaseFeeAndMaxFee
    );
    
    // Validate timeout settings
    require!(
        attempt_timeout_seconds >= game.puzzle_attempt_timeout_seconds,
        ErrorCode::InvalidAttemptTimeoutSeconds
    );
    require!(
        attempt_final_timeout_seconds >= game.puzzle_attempt_final_timeout_seconds,
        ErrorCode::InvalidAttemptFinalTimeoutSeconds
    );

    // Initialize puzzle state
    puzzle.creator = creator.key();
    puzzle.status = PuzzleStatus::Active {
        last_resolved_at: 0,
    };
    puzzle.nonce = puzzle_nonce;
    puzzle.initial_prize = prize_amount;
    puzzle.prompt_hash = prompt_hash;
    puzzle.metadata_hash = metadata_hash;

    puzzle.currency_mint = puzzle_currency.mint;
    puzzle.currency_service_fee_bps = puzzle_currency.service_fee_bps;
    puzzle.currency_base_fee = base_fee;
    puzzle.currency_max_fee = max_fee;
    puzzle.max_attempts = max_attempts;
    puzzle.attempt_timeout_seconds = attempt_timeout_seconds;
    puzzle.attempt_final_timeout_seconds = attempt_final_timeout_seconds;

    Ok(())
}