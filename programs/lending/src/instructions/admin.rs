//! Handles new account needed

use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

/// Define the struct needed for our context to create the instruction for intializing a bank
#[derive(Accounts)]
pub struct InitializeBank<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// The mint address of asset of the bank
    pub mint: InterfaceAccount<'info, Mint>,
}