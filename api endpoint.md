# 🚀 Digital Wallet Fintech API - Endpoint Testing Guide

This document contains a complete guide and reference for testing all API endpoints in the **Digital Wallet Fintech API**.

---

## 📌 Base URL

```text
http://localhost:3000
```

---

## 🔄 Recommended Testing Workflow

Follow this sequence to test the entire lifecycle of the fintech system:

1. **Seed Database** (`POST /seed`) – Resets and populates system accounts, sample users, and double-entry ledger entries.
2. **View Seed Summary** (`GET /seed/summary`) – Check all created users, wallets, accounts, and transaction records.
3. **Create New User & Wallet** (`POST /wallets`) – Register a new customer with an associated wallet and liability account.
4. **Get Wallet Details** (`GET /wallets/:id`) – Check account balances and status.
5. **Deposit Funds** (`POST /transactions/deposit`) – Top up funds into a wallet.
6. **P2P Transfer** (`POST /transactions/transfer`) – Transfer funds between two user wallets.
7. **Withdraw Funds** (`POST /transactions/withdraw`) – Withdraw cash from a wallet with fee deduction.
8. **Verify Balance from Ledger** (`GET /transactions/balance/:accountId/verify`) – Calculate and verify balance accuracy against double-entry ledgers.

---

## 📋 API Endpoints Reference

### 1. Database Seeder

#### 1.1 Seed Database
Resets database tables and seeds system accounts, 3 demo users (Alice, Bob, Charlie), initial capital deposits, P2P transfers, withdrawals, idempotency keys, and audit logs.

- **Method**: `POST`
- **Endpoint**: `/seed`
- **Headers**: None required

##### cURL Command
```bash
curl -X POST http://localhost:3000/seed
```

##### Sample Response (201 Created)
```json
{
  "message": "Database Seeder Summary Overview",
  "counts": {
    "users": 3,
    "wallets": 3,
    "accounts": 5,
    "transactions": 5,
    "idempotencyKeys": 1,
    "auditLogs": 2
  }
}
```

---

#### 1.2 Get Database Summary Overview
Returns all table row counts and entity details stored in the database.

- **Method**: `GET`
- **Endpoint**: `/seed/summary`
- **Headers**: None required

##### cURL Command
```bash
curl -s http://localhost:3000/seed/summary
```

---

### 2. Wallets Module

#### 2.1 Create User & Wallet
Creates a user along with an active MMK currency wallet and an associated liability account.

- **Method**: `POST`
- **Endpoint**: `/wallets`
- **Headers**: `Content-Type: application/json`

##### Request Body
```json
{
  "email": "david@fintech.dev",
  "fullName": "David Miller"
}
```

##### cURL Command
```bash
curl -X POST http://localhost:3000/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "email": "david@fintech.dev",
    "fullName": "David Miller"
  }'
```

##### Sample Response (201 Created)
```json
{
  "user": {
    "id": "60526dd4-05cd-428c-b03e-1941ab825f1f",
    "email": "david@fintech.dev",
    "fullName": "David Miller",
    "createdAt": "2026-07-31T16:23:57.000Z",
    "updatedAt": "2026-07-31T16:23:57.000Z"
  },
  "wallet": {
    "id": "dc4b9376-957e-4098-892f-0c49a59751fd",
    "userId": "60526dd4-05cd-428c-b03e-1941ab825f1f",
    "currency": "MMK",
    "status": "ACTIVE",
    "createdAt": "2026-07-31T16:23:57.000Z",
    "updatedAt": "2026-07-31T16:23:57.000Z"
  },
  "account": {
    "id": "ee123f66-9e15-45df-b3b2-cdfbba380854",
    "walletId": "dc4b9376-957e-4098-892f-0c49a59751fd",
    "name": "David Miller's Payable Account",
    "accountType": "LIABILITY",
    "cachedBalance": 0,
    "version": 1
  }
}
```

---

#### 2.2 Get Wallet Details
Fetches wallet status, owner user details, and associated accounts with cached balances.

- **Method**: `GET`
- **Endpoint**: `/wallets/:id`
- **URL Params**: `id` (Wallet UUID)

##### cURL Command
```bash
curl -s http://localhost:3000/wallets/dc4b9376-957e-4098-892f-0c49a59751fd
```

##### Sample Response (200 OK)
```json
{
  "id": "dc4b9376-957e-4098-892f-0c49a59751fd",
  "userId": "60526dd4-05cd-428c-b03e-1941ab825f1f",
  "currency": "MMK",
  "status": "ACTIVE",
  "user": {
    "id": "60526dd4-05cd-428c-b03e-1941ab825f1f",
    "email": "david@fintech.dev",
    "fullName": "David Miller"
  },
  "accounts": [
    {
      "id": "ee123f66-9e15-45df-b3b2-cdfbba380854",
      "walletId": "dc4b9376-957e-4098-892f-0c49a59751fd",
      "name": "David Miller's Payable Account",
      "accountType": "LIABILITY",
      "cachedBalance": 0
    }
  ]
}
```

---

### 3. Transactions & Ledger Module

#### 3.1 Deposit Funds
Top up funds into a user's wallet. Automatically generates double-entry ledger records (Debit Bank Reserve, Credit User Account).

- **Method**: `POST`
- **Endpoint**: `/transactions/deposit`
- **Headers**:
  - `Content-Type: application/json`
  - `x-idempotency-key: <unique-uuid>` *(Optional / Recommended for safe retry)*

##### Request Body
```json
{
  "walletId": "dc4b9376-957e-4098-892f-0c49a59751fd",
  "amount": 50000,
  "description": "Initial balance deposit"
}
```

##### cURL Command
```bash
curl -X POST http://localhost:3000/transactions/deposit \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: dep-key-001" \
  -d '{
    "walletId": "dc4b9376-957e-4098-892f-0c49a59751fd",
    "amount": 50000,
    "description": "Initial balance deposit"
  }'
```

##### Sample Response (201 Created)
```json
{
  "id": "7f92c524-686e-4890-bbc8-6c6f9bb522d0",
  "idempotencyKey": "dep-key-001",
  "type": "DEPOSIT",
  "status": "POSTED",
  "totalAmount": 50000,
  "description": "Initial balance deposit",
  "createdAt": "2026-07-31T16:24:02.000Z"
}
```

---

#### 3.2 P2P Transfer Funds
Transfers funds from a sender wallet to a receiver wallet. Automatically validates sufficient balance and maintains ledger double-entry balances (Debit Sender Account, Credit Receiver Account).

- **Method**: `POST`
- **Endpoint**: `/transactions/transfer`
- **Headers**:
  - `Content-Type: application/json`
  - `x-idempotency-key: <unique-uuid>` *(Optional / Recommended)*

##### Request Body
```json
{
  "senderWalletId": "SENDER_WALLET_UUID",
  "receiverWalletId": "RECEIVER_WALLET_UUID",
  "amount": 10000,
  "description": "Lunch split payment"
}
```

##### cURL Command
```bash
curl -X POST http://localhost:3000/transactions/transfer \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: p2p-key-001" \
  -d '{
    "senderWalletId": "SENDER_WALLET_UUID",
    "receiverWalletId": "RECEIVER_WALLET_UUID",
    "amount": 10000,
    "description": "Lunch split payment"
  }'
```

##### Sample Response (201 Created)
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "idempotencyKey": "p2p-key-001",
  "type": "TRANSFER",
  "status": "POSTED",
  "totalAmount": 10000,
  "description": "Lunch split payment",
  "createdAt": "2026-07-31T16:25:00.000Z"
}
```

---

#### 3.3 Withdraw Funds
Withdraws funds from a user's wallet with an optional service fee.

- **Method**: `POST`
- **Endpoint**: `/transactions/withdraw`
- **Headers**:
  - `Content-Type: application/json`
  - `x-idempotency-key: <unique-uuid>` *(Optional / Recommended)*

##### Request Body
```json
{
  "walletId": "dc4b9376-957e-4098-892f-0c49a59751fd",
  "amount": 20000,
  "feeAmount": 1000,
  "description": "ATM cash withdrawal"
}
```

##### cURL Command
```bash
curl -X POST http://localhost:3000/transactions/withdraw \
  -H "Content-Type: application/json" \
  -H "x-idempotency-key: wdr-key-001" \
  -d '{
    "walletId": "dc4b9376-957e-4098-892f-0c49a59751fd",
    "amount": 20000,
    "feeAmount": 1000,
    "description": "ATM cash withdrawal"
  }'
```

---

#### 3.4 Verify Ledger Balance Consistency
Re-calculates an account's true balance dynamically by summing up all historical debit and credit ledger entries and compares it against the account's cached balance.

- **Method**: `GET`
- **Endpoint**: `/transactions/balance/:accountId/verify`
- **URL Params**: `accountId` (Account UUID)

##### cURL Command
```bash
curl -s http://localhost:3000/transactions/balance/ee123f66-9e15-45df-b3b2-cdfbba380854/verify
```

##### Sample Response (200 OK)
```json
{
  "accountId": "ee123f66-9e15-45df-b3b2-cdfbba380854",
  "ledgerComputedBalance": 50000,
  "isBalanced": true
}
```

---

## 🔑 Testing Idempotency Support

All `/transactions/*` endpoints support the `x-idempotency-key` header to prevent double-spending or duplicate transactions during network retries.

### How to Test:
1. Execute a deposit/transfer/withdraw request with a specific key (e.g. `x-idempotency-key: test-key-100`).
2. Re-send the exact same command immediately with the same key.
3. Observe that the API returns the **cached response** without creating a second transaction or deducting funds twice!
