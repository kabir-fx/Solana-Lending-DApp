import { describe, it } from 'node:test';
import { BankrunProvider, startAnchor } from 'anchor-bankrun';

import IDL from '../target/idl/lending.json';
import { Lending } from '../target/types/lending';
import { BanksClient, ProgramTestContext } from 'solana-bankrun';
import { PublicKey, Connection } from '@solana/web3.js';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { BankrunContextWrapper } from '../bankrun-utils/bankrunConnection';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';

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



    // Pyth price feed ID to get the current price of SOL
    const SOL_PRICE_FEED_ID = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
    // Correspinding pyth feed account
    const pythSolanaReceiver = new PythSolanaReceiver({
        connection,
        wallet: provider.wallet,
    });

    // Now that we have pyth solana receiver, we can use that to get the current price of SOL
    const solUsdPriceFeedAccount = pythSolanaReceiver.getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID);

    // Get the account info for the corresponding pyth feed account on devenet
    const feedAccountInfo = await devnetConnection.getAccountInfo(solUsdPriceFeedAccount);

    // Since this is another account we need deployed on the bankrun server - we need to update. Since, we are doing this after anchorStart we can update by using setAccount to add new accounts
    context.setAccount(solUsdPriceFeedAccount, feedAccountInfo);

    const program: Program<Lending> = new Program(IDL as Lending, provider);

    // Since we will be using banks and clients thoroughout the tests we are defining them as variables
    const banksClients: BanksClient = context.banksClient;
    const signer: Keypair = provider.wallet.payer;

});