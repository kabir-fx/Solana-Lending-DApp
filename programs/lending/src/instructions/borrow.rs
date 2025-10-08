//! Handles the borrow instruction that will be used to cal. the quantity of assests that a user can borrow against their collateral.

use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{Mint, TokenAccount, TokenInterface}};

use crate::state::{Bank, User};

/// Define the struct needed for our context to create the instruction for borrowing assets
#[derive(Accounts)]
pub struct Borrow<'info> {
    /// The signer of the transaction
    #[account(mut)]
    pub signer: Signer<'info>,

    /// The mint address of the asset to be borrowed
    pub mint: InterfaceAccount<'info, Mint>,

    /// The bank account of the mint that the user wants to borrow
    #[account(
        mut,
        seeds = [mint.key().as_ref()],
        bump,
    )]
    pub bank: Account<'info, Bank>,

    /// The bank token account of the mint that the user wants to borrow
    #[account(
        mut,
        seeds = [b"Treasury", mint.key().as_ref()],
        bump,
    )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,

    /// The user account that stores the state of the user
    #[account(
        mut,
        seeds = [signer.key().as_ref()],
        bump,
    )]
    pub user_account: Account<'info, User>,

    /// The user token account which (will) hold the tokens that the user is looking to borrow
    ///
    /// Since we can't guarantee that the user will have a token account for the mint that they are looking to borrow, we will initialize it if needed.
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = user_account,
        associated_token::token_program = token_program,
    )]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Associated token program because it's referenced in the instruction
    pub associated_token_program: Program<'info, AssociatedToken>,

    /// Token program because it's referenced in the instruction
    pub token_program: Interface<'info, TokenInterface>,

    /// System program to POTENTIALLY create a new account and also because it's required by the instruction
    pub system_program: Program<'info, System>,
}

/// Instruction to process the borrow.
///
/// Before processing the borrow, we need to check if the user has deposited enough collateral to be able to borrow the desired amount.
pub fn process_borrow(ctx: Context<Borrow>, amount_to_borrow: u64) -> Result<()> {
    // TODO: Implement the borrow logic
    
    Ok(())
}