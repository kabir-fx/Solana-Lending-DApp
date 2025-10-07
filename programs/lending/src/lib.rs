use anchor_lang::prelude::*;
use instructions::admin::*;
use instructions::deposit::*;

mod instructions;
mod state;

declare_id!("6awyXWuEkqhNWpmPRJpzZXuz8z8KVzh347jjSqywuokC");

#[program]
pub mod lending {
    use super::*;

    pub fn initialize_bank(ctx: Context<InitializeBank>, liquidation_threshold: u64, max_ltv: u64) -> Result<()> {
        process_initialize_bank(ctx, liquidation_threshold, max_ltv)
    }

    pub fn initialize_account(ctx: Context<InitializeAccount>, usdc_address: Pubkey) -> Result<()> {
        process_initialize_account(ctx, usdc_address)
    }

    pub fn deposit(ctx: Context<Deposit>, amount_to_deposit: u64) -> Result<()> {
        process_deposit(ctx, amount_to_deposit)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
