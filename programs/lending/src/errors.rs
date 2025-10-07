use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("User has not deposited enough tokens to withdraw")]
    InsufficientFunds,
}