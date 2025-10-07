use anchor_lang::prelude::*;
use instructions::admin::*;

mod instructions;
mod state;

declare_id!("6awyXWuEkqhNWpmPRJpzZXuz8z8KVzh347jjSqywuokC");

#[program]
pub mod lending {
    use super::*;

    pub fn initialize_bank(ctx: Context<InitializeBank>, liquidation_threshold: u64, max_ltv: u64) -> Result<()> {
        process_initialize_bank(ctx, liquidation_threshold, max_ltv)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
