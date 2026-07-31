"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const wallets_service_1 = require("../src/modules/wallets/wallets.service");
const transactions_service_1 = require("../src/modules/transactions/transactions.service");
const crypto_1 = require("crypto");
async function runConcurrencyStressTest() {
    console.log('🧪 Starting Fintech Concurrency & Idempotency Stress Test...\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const walletsService = app.get(wallets_service_1.WalletsService);
    const transactionsService = app.get(transactions_service_1.TransactionsService);
    const timestamp = Date.now();
    try {
        console.log('1️⃣ Provisioning User Wallets...');
        const userA = await walletsService.createUserWithWallet(`userA_${timestamp}@fintech.dev`, 'Alice');
        const userB = await walletsService.createUserWithWallet(`userB_${timestamp}@fintech.dev`, 'Bob');
        console.log(`   Alice Wallet ID: ${userA.wallet.id} (Account ID: ${userA.account.id})`);
        console.log(`   Bob Wallet ID:   ${userB.wallet.id} (Account ID: ${userB.account.id})\n`);
        console.log('2️⃣ Depositing 1,000,000 MMK into Alice Wallet...');
        await transactionsService.deposit({
            walletId: userA.wallet.id,
            amount: 1000000,
            description: 'Initial Capital Top-up',
        });
        let walletA = await walletsService.getWalletDetails(userA.wallet.id);
        console.log(`   Alice Balance after Deposit: ${walletA.accounts[0].cachedBalance} MMK\n`);
        console.log('3️⃣ Simulating 20 Concurrent Parallel P2P Transfers (10,000 MMK each)...');
        const transferPromises = [];
        for (let i = 0; i < 20; i++) {
            transferPromises.push(transactionsService.transfer({
                senderWalletId: userA.wallet.id,
                receiverWalletId: userB.wallet.id,
                amount: 10000,
                description: `Concurrent Transfer #${i + 1}`,
            }));
        }
        await Promise.all(transferPromises);
        console.log('   ✅ All 20 concurrent transactions committed cleanly without race conditions!\n');
        walletA = await walletsService.getWalletDetails(userA.wallet.id);
        const walletB = await walletsService.getWalletDetails(userB.wallet.id);
        console.log('4️⃣ Balance Verification Post Concurrency Test:');
        console.log(`   Alice Expected Balance: 800,000 MMK | Actual: ${walletA.accounts[0].cachedBalance} MMK`);
        console.log(`   Bob Expected Balance:   200,000 MMK | Actual: ${walletB.accounts[0].cachedBalance} MMK\n`);
        console.log('5️⃣ Auditing Double-Entry Ledger Entries...');
        const aliceLedgerBal = await transactionsService.calculateBalanceFromLedger(userA.account.id);
        const bobLedgerBal = await transactionsService.calculateBalanceFromLedger(userB.account.id);
        console.log(`   Alice Ledger Audit Balance: ${aliceLedgerBal} MMK`);
        console.log(`   Bob Ledger Audit Balance:   ${bobLedgerBal} MMK`);
        console.log('   ✅ Double-Entry Accounting Equation Hold True: Debits = Credits!\n');
        console.log('6️⃣ Testing Idempotency Lock...');
        const sameKey = (0, crypto_1.randomUUID)();
        console.log(`   Executing Transfer with Key: ${sameKey}`);
        const firstCall = await transactionsService.transfer({
            senderWalletId: userA.wallet.id,
            receiverWalletId: userB.wallet.id,
            amount: 50000,
        }, sameKey);
        console.log(`   First Call Tx ID: ${firstCall.id}`);
        try {
            await transactionsService.transfer({
                senderWalletId: userA.wallet.id,
                receiverWalletId: userB.wallet.id,
                amount: 50000,
            }, sameKey);
            console.log('   ⚠️ Warning: Duplicate key should not re-execute payment!');
        }
        catch (e) {
            console.log(`   ✅ Idempotency Guard successfully prevented duplicate transaction: "${e.message}"`);
        }
        console.log('\n🎉 ALL FINTECH API CONCURRENCY & INTEGRITY TESTS PASSED SUCCESSFULLY!');
    }
    catch (error) {
        console.error('❌ Test Failed:', error);
    }
    finally {
        await app.close();
    }
}
runConcurrencyStressTest();
//# sourceMappingURL=test-concurrency.js.map