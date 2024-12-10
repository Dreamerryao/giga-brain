use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

/// Transfers SOL from a puzzle's escrow account to a specified recipient
///
/// # Arguments
/// * `puzzle` - The puzzle account containing creator and nonce information
/// * `system_program` - The Solana System Program account
/// * `to` - The recipient account that will receive the SOL
/// * `escrow` - The escrow account holding the funds
/// * `escrow_bump` - The PDA bump seed for the escrow account
/// * `amount` - The amount of SOL (in lamports) to transfer
///
/// # Returns
/// * `Result<()>` - Result indicating success or failure of the transfer
pub fn defund_puzzle_escrow<'info>(
    puzzle: &mut Account<'info, Puzzle>,
    system_program: &AccountInfo<'info>,
    to: &mut AccountInfo<'info>,
    escrow: &mut AccountInfo<'info>,
    escrow_bump: u8,
    amount: u64,
) -> Result<()> {
    // Record initial balances for verification
    let escrow_balance_before = escrow.get_lamports();
    let to_balance_before = to.get_lamports();

    // Construct PDA signer seeds
    let puzzle_nonce_bytes = puzzle.nonce.to_le_bytes();
    let bump = &[escrow_bump];
    let seeds: &[&[u8]] = &[
        Puzzle::ESCROW_SEED.as_bytes(),
        puzzle.creator.as_ref(),
        &puzzle_nonce_bytes.as_ref(),
        bump,
    ];
    let signer_seeds = &[&seeds[..]];

    // Execute the transfer
    anchor_lang::system_program::transfer(
        CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: escrow.to_account_info(),
                to: to.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        amount,
    )?;

    // Verify the transfer was successful
    let escrow_balance_after = escrow.get_lamports();
    let to_balance_after = to.get_lamports();
    require_eq!(escrow_balance_after, escrow_balance_before - amount);
    require_eq!(to_balance_after, to_balance_before + amount);

    Ok(())
}

/// Transfers SPL tokens from a puzzle's escrow token account to a specified recipient
///
/// # Arguments
/// * `puzzle` - The puzzle account containing creator and nonce information
/// * `token_program` - The SPL Token Program account
/// * `to_token` - The recipient's token account
/// * `escrow_token` - The escrow token account holding the funds
/// * `escrow_token_bump` - The PDA bump seed for the escrow token account
/// * `amount` - The amount of tokens to transfer
///
/// # Returns
/// * `Result<()>` - Result indicating success or failure of the transfer
pub fn defund_puzzle_escrow_token<'info>(
    puzzle: &mut Account<'info, Puzzle>,
    token_program: &AccountInfo<'info>,
    to_token: &mut Account<'info, TokenAccount>,
    escrow_token: &mut Account<'info, TokenAccount>,
    escrow_token_bump: u8,
    amount: u64,
) -> Result<()> {
    let escrow_balance_before = escrow_token.amount;
    let to_balance_before = to_token.amount;

    let puzzle_nonce_bytes = puzzle.nonce.to_le_bytes();
    let bump = &[escrow_token_bump];
    let seeds: &[&[u8]] = &[
        Puzzle::ESCROW_SEED.as_bytes(),
        puzzle.creator.as_ref(),
        &puzzle_nonce_bytes.as_ref(),
        bump,
    ];
    let signer_seeds = &[&seeds[..]];
    anchor_spl::token::transfer(
        CpiContext::new(
            token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: escrow_token.to_account_info(),
                to: to_token.to_account_info(),
                authority: escrow_token.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        amount,
    )?;

    escrow_token.reload()?;
    to_token.reload()?;

    let escrow_balance_after = escrow_token.amount;
    let to_balance_after = to_token.amount;
    require_eq!(escrow_balance_after, escrow_balance_before - amount);
    require_eq!(to_balance_after, to_balance_before + amount);

    Ok(())
}

/// Calculates the attempt price using an exponential growth formula
///
/// # Arguments
/// * `base_fee` - The initial fee for the first attempt
/// * `max_fee` - The maximum fee cap
/// * `max_attempts` - The number of attempts before reaching max_fee
/// * `attempt` - The current attempt number
///
/// # Returns
/// * `u64` - The calculated price for the current attempt
pub fn calculate_price(base_fee: u64, max_fee: u64, max_attempts: u32, attempt: u64) -> u64 {
    // Early returns for edge cases
    if attempt == 0 {
        return base_fee;
    }
    if attempt > max_attempts.into() {
        return max_fee;
    }

    // Cache the conversion to avoid multiple conversions
    let base_fee_f64 = base_fee as f64;
    let max_fee_f64 = max_fee as f64;
    let attempt_f64 = attempt as f64;
    let max_attempts_f64 = max_attempts as f64;

    // Calculate growth factor and price
    let growth_factor = (max_fee_f64 / base_fee_f64).ln() / max_attempts_f64;
    let price = base_fee_f64 * (growth_factor * attempt_f64).exp();

    price.min(max_fee_f64) as u64
}
