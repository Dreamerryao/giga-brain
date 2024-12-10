use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

/// Configuration arguments for setting up a puzzle currency
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PuzzleCurrencyConfigArgs {
    /// The SPL token mint address for this currency configuration
    pub mint: Pubkey,
    /// Service fee in basis points (1/100th of a percent). Max 10000 (100%)
    pub service_fee_bps: u16,
    /// Minimum amount required for initial prize pool creation
    pub minimum_initial_prize: u64,
    /// Fee configuration structure for this currency
    pub fee_config: PuzzleFeeConfig,
}

/// Account context for creating a new puzzle currency configuration
#[derive(Accounts)]
pub struct CreatePuzzleCurrencyConfig<'info> {
    /// PDA account that stores the currency configuration
    /// Seeds: ['puzzle-currency', mint_address]
    #[account(
        init_if_needed,
        space = 8 + std::mem::size_of::<PuzzleCurrency>(),
        payer = admin,
        seeds = [PuzzleCurrency::SEED.as_bytes(), mint.key().as_ref()],
        bump,
    )]
    pub puzzle_currency: Account<'info, PuzzleCurrency>,

    /// Admin account that pays for the initialization and must sign
    #[account(mut)]
    pub admin: Signer<'info>,

    /// The SPL token mint account this configuration is for
    pub mint: Account<'info, Mint>,

    /// Required by Solana runtime
    pub system_program: Program<'info, System>,
}

/// Account context for updating an existing puzzle currency configuration
#[derive(Accounts)]
pub struct SetPuzzleCurrencyConfig<'info> {
    #[account(
        mut,
        seeds = [PuzzleCurrency::SEED.as_bytes(), mint.key().as_ref()],
        bump,
    )]
    pub puzzle_currency: Account<'info, PuzzleCurrency>,

    #[account(
        constraint = mint.key() == puzzle_currency.mint @ ErrorCode::InvalidMint
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Creates a new puzzle currency configuration with the specified parameters
pub fn create_puzzle_currency_config(
    puzzle_currency: &mut Account<PuzzleCurrency>,
    args: PuzzleCurrencyConfigArgs,
) -> Result<()> {
    puzzle_currency.mint = args.mint;
    set_puzzle_currency_config(puzzle_currency, args)?;
    Ok(())
}

/// Updates an existing puzzle currency configuration
///
/// # Arguments
/// * `puzzle_currency` - The account to update
/// * `args` - New configuration parameters
///
/// # Errors
/// Returns error if service fee basis points exceed 100% (10000 bps)
pub fn set_puzzle_currency_config(
    puzzle_currency: &mut Account<PuzzleCurrency>,
    args: PuzzleCurrencyConfigArgs,
) -> Result<()> {
    require!(
        args.service_fee_bps <= 10000,
        ErrorCode::InvalidServiceFeeBps
    );
    puzzle_currency.service_fee_bps = args.service_fee_bps;
    puzzle_currency.minimum_initial_prize = args.minimum_initial_prize;
    puzzle_currency.fee_config = args.fee_config;
    Ok(())
}
