# Solana Lending Protocol

A decentralized lending protocol built on Solana that enables users to deposit assets as collateral and borrow other assets, with integrated liquidation protection and real-time price feeds.

## 🚀 Overview

This lending protocol allows users to:
- **Deposit** assets (SOL or USDC) to earn interest
- **Borrow** other assets against their collateral
- **Repay** borrowed positions with accrued interest
- **Withdraw** deposited assets
- **Liquidate** undercollateralized positions

The protocol uses Pyth price feeds for real-time asset valuations and implements sophisticated risk management through liquidation thresholds, maximum loan-to-value ratios, and automated liquidation mechanisms.

## ✨ Key Features

### 🔄 Multi-Asset Lending
- Support for SOL and USDC assets
- Cross-asset borrowing (deposit one asset, borrow another)
- Separate liquidity pools for each asset

### 📊 Real-Time Price Feeds
- Integration with Pyth Network price feeds
- Real-time SOL/USD and USDC/USD prices
- Accurate collateral valuation for risk management

### 💰 Interest Accrual
- Continuous compounding interest
- Time-weighted interest calculations
- Separate deposit and borrow interest rates

### 🛡️ Risk Management
- **Liquidation Threshold**: Maximum LTV before liquidation (configurable)
- **Maximum LTV**: Borrowing limit as percentage of collateral value
- **Liquidation Bonus**: Incentive for liquidators
- **Liquidation Close Factor**: Maximum portion of debt liquidated at once

### 🔐 Security Features
- Program-derived addresses (PDAs) for secure account management
- Share-based accounting to prevent precision loss
- Comprehensive error handling and validation

## 🏗️ Architecture

### Core Accounts

#### Bank Account
Each supported asset has its own bank account that tracks:
- Total deposits and deposit shares
- Total borrows and borrow shares
- Risk parameters (liquidation threshold, max LTV, etc.)
- Interest rate and last update timestamp

#### User Account
Each user has a personal account tracking:
- Deposited amounts and shares for SOL and USDC
- Borrowed amounts and shares for SOL and USDC
- Last interaction timestamp for interest calculations

### Program Instructions

1. **`initialize_bank`** - Creates a new lending pool for an asset
2. **`initialize_account`** - Sets up a user account
3. **`deposit`** - Deposit assets to earn interest
4. **`withdraw`** - Withdraw deposited assets with accrued interest
5. **`borrow`** - Borrow assets against collateral
6. **`repay`** - Repay borrowed assets with accrued interest
7. **`liquidate`** - Liquidate undercollateralized positions

## 🔄 How It Works

### Deposit Flow
1. User deposits SOL or USDC into the protocol
2. Protocol mints "shares" representing ownership in the pool
3. User earns interest on their deposited amount over time

### Borrow Flow
1. User deposits collateral (e.g., USDC)
2. Protocol calculates maximum borrowable amount based on:
   - Collateral value × Maximum LTV ratio
   - Current price feeds from Pyth
3. User borrows another asset (e.g., SOL) up to the limit
4. Borrowed amount accrues interest over time

### Liquidation Protection
- **Health Factor** = (Collateral Value × Liquidation Threshold) / Borrowed Value
- If Health Factor < 1, position can be liquidated
- Liquidators repay part of the debt and receive collateral + bonus
- Maximum liquidation amount limited by close factor

### Interest Calculation
Interest accrues continuously using exponential growth:
```
new_amount = deposited_amount × e^(interest_rate × time_elapsed)
```

## 🛠️ Technical Details

### Dependencies
- **Anchor**: Solana smart contract framework
- **Pyth Network**: Real-time price feeds
- **SPL Token**: Solana token standard
- **Bankrun**: Local testing environment

### Price Feed Integration
```rust
// SOL/USD and USDC/USD price feeds
const SOL_USD_FEED_ID: &str = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
const USDC_USD_FEED_ID: &str = "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";
```

### Share-Based Accounting
The protocol uses shares instead of direct amounts to:
- Prevent precision loss in interest calculations
- Maintain accurate accounting across time
- Enable fair distribution of yields

## 🚀 Getting Started

### Prerequisites
- Node.js and npm/yarn
- Solana CLI tools
- Anchor framework

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd solana-lending

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test
```

### Local Development
```bash
# Start local validator
solana-test-validator

# Deploy to localnet
anchor deploy

# Run test suite
yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts
```

## 🧪 Testing

The protocol includes comprehensive tests using Bankrun:
- Bank initialization and funding
- User account setup
- Deposit/withdraw operations
- Borrowing and repayment
- Liquidation scenarios

Run tests with:
```bash
anchor test
```

## 🔒 Security Considerations

- **Price Feed Staleness**: Protocol checks price feed age (max 24 hours)
- **Liquidation Thresholds**: Conservative defaults prevent excessive borrowing
- **Share Accounting**: Prevents rounding errors in yield calculations
- **PDA Security**: All critical accounts use program-derived addresses

## 🚧 Known Limitations

- Currently supports only SOL and USDC
- Interest rates are fixed (not dynamic)
- No flash loan protection mechanisms
- Liquidation bonus not fully parameterized

## 🔮 Future Enhancements

- [ ] Dynamic interest rates based on utilization
- [ ] Support for additional assets (BTC, ETH, etc.)
- [ ] Flash loan prevention
- [ ] Governance for protocol parameters
- [ ] Multi-collateral positions
- [ ] Lending pool rewards/incentives
- [ ] Cross-chain expansion

## 📄 License

ISC License

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Check the test files for usage examples
- Review the Anchor documentation

---

*Built with ❤️ on Solana*
