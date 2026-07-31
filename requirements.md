# Requirements Specification: Digital Wallet & Fintech Transaction API

## 1. Executive Summary & Objective
- **Goal**: Build a production-ready, enterprise-grade Digital Wallet & Fintech Transaction API in NestJS.
- **Target Audience / Skill Level**: Designed for mid-level developers aiming for senior-level fintech system understanding (ACID, double-entry ledger, concurrency locking, idempotency).
- **Core Value**: Zero race conditions, absolute zero financial discrepancy (Debits = Credits), idempotent transaction processing, and immutable audit trailing.

---

## 2. Key Functional Requirements

### 2.1 User & Wallet Management
- **US-01**: User Onboarding & Account Provisioning
  - Create User Profile.
  - Automatically initialize primary wallet with 2 ledger accounts:
    - User Payable Account (Liability account representing user balance)
    - System Clearing Account (Asset account for funding/withdrawals)
- **US-02**: Wallet Balance Inquiry
  - Calculate real-time balance from ledger entries (`SUM(debit) - SUM(credit)` or materialized liability balance).

### 2.2 Double-Entry Bookkeeping Engine
- **US-03**: Fund Deposit (Top-up)
  - Debit: `System Settlement / Bank Account` (Asset ↑)
  - Credit: `User Wallet Account` (Liability ↑)
- **US-04**: Peer-to-Peer (P2P) Wallet Transfer
  - Debit: `Sender Wallet Account` (Liability ↓)
  - Credit: `Receiver Wallet Account` (Liability ↑)
- **US-05**: Withdrawal / Payment with Service Fee
  - Debit: `User Wallet Account` (Liability ↓)
  - Credit: `System Fee Revenue Account` (Revenue ↑)
  - Credit: `External Settlement Account` (Asset ↓)

### 2.3 Idempotency & Safety Guards
- **US-06**: Idempotent Transaction Execution
  - API must accept `X-Idempotency-Key` header.
  - Duplicate API requests with the same key within TTL (24h) must return the cached transaction response without re-executing balance movement.
  - Concurrent duplicate API calls must be blocked (`409 Conflict` or atomic lock).

### 2.4 Concurrency & Locking Controls
- **US-07**: Race Condition Prevention via DB Locking
  - Must support **Pessimistic Locking** (`SELECT FOR UPDATE`) during high-frequency balance deductions.
  - Must support **Optimistic Locking** (`version` column) for low-contention scenarios.
  - Ensure strict ACID Isolation Level (Read Committed / Repeatable Read).

### 2.5 Audit Trail & Logging
- **US-08**: Immutable Audit Logging
  - Log all transaction attempts, state transitions (`PENDING`, `POSTED`, `FAILED`), actor IDs, IP addresses, and payload signatures.
  - Non-updatable, non-deletable log history.

---

## 3. Non-Functional Requirements (NFRs)

| Metric | Target / Constraint |
| :--- | :--- |
| **Financial Integrity** | $\sum \text{Debits} = \sum \text{Credits}$ must hold true across all ledger entries. |
| **Concurrency Safety** | 100 simultaneous requests on the same wallet must result in accurate balance and zero double-spends. |
| **Idempotency Window** | 24 Hours via Redis/DB store. |
| **Data Consistency** | Strict PostgreSQL ACID transactions with rollbacks on any sub-step failure. |
| **Latency** | < 100ms for P2P transfers under normal load. |
