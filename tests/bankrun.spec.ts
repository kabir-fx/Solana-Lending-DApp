import { describe, it } from "node:test";
import { BN, Program } from "@coral-xyz/anchor";
import { BankrunProvider } from "anchor-bankrun";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createAccount, createMint, mintTo } from "spl-token-bankrun";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";

import { startAnchor, BanksClient, ProgramTestContext } from "solana-bankrun";

import { PublicKey, Keypair, Connection } from "@solana/web3.js";

// @ts-ignore
import IDL from "../target/idl/lending.json";
import { Lending } from "../target/types/lending";
import { BankrunContextWrapper } from "../bankrun-utils/bankrunConnection";

describe("Lending Smart Contract Test", async () => {
    // Pyth addresse (Program ID) taken from SolanaFM
    const pyth = new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE");

    // Quering the devnet to get this account's info
    const devnetConnection = new Connection("https://api.devnet.solana.com");
    const accountInfo = await devnetConnection.getAccountInfo(pyth);

    // startAnchor starts a bankrun in the anchor workspace with all of the workspace programs deployed.
    let context: ProgramTestContext = await startAnchor(
        // Since we created our own lending.so in fixtures - we can just make our path an empty string.
        '',
        // List of all the programs we want to deploy being pulled from the IDL on the bankrun server
        [{ name: 'lending', programId: new PublicKey(IDL.address) }],
        // List of all the accounts we want to add to the bankrun
        [{ address: pyth, info: accountInfo }],
    );

    // Instantiate the provider
    let provider: BankrunProvider = new BankrunProvider(context);

    // Instantiate the bankrun context wrapper
    let bankrunContextWrapper: BankrunContextWrapper = new BankrunContextWrapper(context);

    const connection = bankrunContextWrapper.connection.toConnection();

    // Pyth price feed IDs
    const SOL_PRICE_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
    const USDC_PRICE_FEED_ID = "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";

    // Corresponding pyth feed account
    const pythSolanaReceiver = new PythSolanaReceiver({
        connection,
        wallet: provider.wallet,
    });

    // Get price feed accounts for both SOL and USDC
    const solUsdPriceFeedAccount = pythSolanaReceiver.getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID);
    const usdcUsdPriceFeedAccount = pythSolanaReceiver.getPriceFeedAccountAddress(0, USDC_PRICE_FEED_ID);

    // Get the account info for both price feeds from devnet
    const solFeedAccountInfo = await devnetConnection.getAccountInfo(solUsdPriceFeedAccount);
    const usdcFeedAccountInfo = await devnetConnection.getAccountInfo(usdcUsdPriceFeedAccount);

    // Add both price feed accounts to the bankrun context
    context.setAccount(solUsdPriceFeedAccount, solFeedAccountInfo);
    context.setAccount(usdcUsdPriceFeedAccount, usdcFeedAccountInfo);

    const program: Program<Lending> = new Program(IDL as Lending, provider);

    // Since we will be using banks and clients thoroughout the tests we are defining them as variables
    const banksClients: BanksClient = context.banksClient;
    const signer: Keypair = provider.wallet.payer;

    // We need spl token for both sol and usdc. Generally the lending protocol will use RAP/SOL since it's a SPL token.
    // We will generate 2 abritary SPL tokens for testing purposes and then be able to use those as pretend SOL and USDC.


    // We are minting this to make sure that we have correct authority needed to run our tests.
    const mintUsdc = await createMint(
        // @ts-ignore
        banksClients,
        signer,     // Payer
        signer.publicKey, // Mint authority
        null, // Freeze authority
        2, // Decimals
    )

    const mintSol = await createMint(
        // @ts-ignore
        banksClients,
        signer,
        signer.publicKey,
        null,
        2,
    )

    // Intializing the PDAs: Bank Token Accounts for both SOL and USDC
    let usdcTokenAccount: PublicKey;
    let solTokenAccount: PublicKey;

    [usdcTokenAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("Treasury"), mintUsdc.toBuffer()],
        new PublicKey(IDL.address),
    );

    [solTokenAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("Treasury"), mintSol.toBuffer()],
        new PublicKey(IDL.address),
    )

    // Now that we have all the accounts and PDAs - we can now move forward to actually creating and running our Transactions.
    it("should test init and fund USDC bank", async () => {
        // Transaction to initialize the USDC bank
        const initUSDCBankTx = await program.methods.
            initializeBank(new BN(1), new BN(1),)
            .accounts({
                signer: signer.publicKey,
                mint: mintUsdc,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc({ commitment: "confirmed" });

        console.log("Initialized USDC bank account: ", initUSDCBankTx);

        // Now that the bank is created define the amount of USDC to deposit into the bank
        const amount = 10_000 * 10 ** 9;

        // Intruction to deposit the USDC into the bank
        const mintUSDCTx = await mintTo(
            // @ts-ignore
            banksClients,
            signer,
            mintUsdc,
            usdcTokenAccount,
            signer,
            amount
        );

        console.log("Minted USDC into bank signature: ", mintUSDCTx);
    });

    it("should test init and fund SOL bank", async () => {
        // Transaction to initialize the SOL bank
        const initSOLBankTx = await program.methods.
            initializeBank(new BN(1), new BN(1),)
            .accounts({
                signer: signer.publicKey,
                mint: mintSol,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc({ commitment: "confirmed" });

        console.log("Initialized SOL bank account: ", initSOLBankTx);

        // Now that the bank is created define the amount of SOL to deposit into the bank
        const amount = 10_000 * 10 ** 9;

        // Intruction to deposit the SOL into the bank
        const mintSOLTx = await mintTo(
            // @ts-ignore
            banksClients,
            signer,
            mintSol,
            solTokenAccount,
            signer,
            amount
        );

        console.log("Minted SOL into bank signature: ", mintSOLTx);
    });

    it("Test init user", async () => {
        const initUserTx = await program.methods.
            initializeAccount(mintUsdc)
            .accounts({
                signer: signer.publicKey,
            })
            .rpc({ commitment: "confirmed" });

        console.log("Initialized user: ", initUserTx);
    });

    it("should create and fund Token Accounts for the user", async () => {
        const usdcTokenAccount = await createAccount(
            // @ts-ignore
            banksClients,
            signer,
            mintUsdc,
            signer.publicKey,
        );

        console.log("Created USDC token account: ", usdcTokenAccount);

        const amount = 10_000 * 10 ** 9;

        const mintUSDCTx = await mintTo(
            // @ts-ignore
            banksClients,
            signer,
            mintUsdc,
            usdcTokenAccount,
            signer,
            amount
        );

        console.log("Minted USDC into user token account: ", mintUSDCTx);
    });

    // Now everything is set up for us to now test our 4 instructions: deposit, withdraw, borrow, repay.
    it("Test Deposit", async () => {
        const depositUSDC = await program.methods
            .deposit(new BN(100000000000))
            .accounts({
                signer: signer.publicKey,
                mint: mintUsdc,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc({ commitment: "confirmed" });

        console.log("Deposit USDC", depositUSDC);
    });

    it("Test Borrow", async () => {
        // When borrowing SOL with USDC collateral, we need the USDC price feed to value the collateral
        const borrowSOL = await program.methods
            .borrow(new BN(1))
            .accounts({
                signer: signer.publicKey,
                mint: mintSol,
                tokenProgram: TOKEN_PROGRAM_ID,
                priceUpdate: usdcUsdPriceFeedAccount,
            })
            .rpc({ commitment: "confirmed" });

        console.log("Borrow SOL", borrowSOL);
    });

    it("should create and fund SOL Token Account for repayment", async () => {
        const solTokenAccount = await createAccount(
            // @ts-ignore
            banksClients,
            signer,
            mintSol,
            signer.publicKey,
        );

        console.log("Created SOL token account for repayment: ", solTokenAccount);

        const amount = 10_000 * 10 ** 9;

        const mintSOLTx = await mintTo(
            // @ts-ignore
            banksClients,
            signer,
            mintSol,
            solTokenAccount,
            signer,
            amount
        );

        console.log("Minted SOL into user token account for repayment: ", mintSOLTx);
    });

    it("Test Repay", async () => {
        const repaySOL = await program.methods
            .repay(new BN(1))
            .accounts({
                signer: signer.publicKey,
                mint: mintSol,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc({ commitment: "confirmed" });

        console.log("Repay SOL", repaySOL);
    });

    it("Test Withdraw", async () => {
        const withdrawUSDC = await program.methods
            .withdraw(new BN(100))
            .accounts({
                signer: signer.publicKey,
                mint: mintUsdc,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc({ commitment: "confirmed" });

        console.log("Withdraw USDC", withdrawUSDC);
    });
});