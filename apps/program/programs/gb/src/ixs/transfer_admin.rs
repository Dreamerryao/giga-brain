use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

/// Accounts required for transferring admin privileges
#[derive(Accounts)]
pub struct TransferAdmin<'info> {
    /// The global game state account
    /// This account holds the current admin's public key and other game configuration
    #[account(
        mut,
        seeds = [Game::SEED.as_bytes()],
        bump,
        has_one = admin @ ErrorCode::InvalidAdmin
    )]
    pub game: Box<Account<'info, Game>>,

    /// The current admin who must sign this transaction
    pub admin: Signer<'info>,

    /// The account that will become the new admin
    /// CHECK: Safe because this account is only used as a reference for PDA derivation
    /// and to store its public key
    pub new_admin: AccountInfo<'info>,
}

/// Instruction handler to transfer admin privileges to a new account
///
/// # Arguments
/// * `ctx` - The context object containing the accounts
///
/// # Returns
/// * `Result<()>` - Result indicating success or failure of the operation
pub fn transfer_admin(ctx: Context<TransferAdmin>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    game.admin = ctx.accounts.new_admin.key();
    Ok(())
}
