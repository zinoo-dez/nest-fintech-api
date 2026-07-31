# Step-by-Step Task Roadmap: NestJS Digital Wallet API

## Phase 1: Environment & Architecture Foundations
- [x] **Task 1.1**: Initialize NestJS Application structure with TypeScript configuration.
- [x] **Task 1.2**: Configure Docker Compose for PostgreSQL (Database) & Redis (Idempotency Cache).
- [x] **Task 1.3**: Configure TypeORM database module with environment variables and connection pooling settings.

## Phase 2: Schema & Entities Implementation
- [x] **Task 2.1**: Implement `User` and `Wallet` entities.
- [x] **Task 2.2**: Implement `Account` entity (Asset, Liability, Revenue, Expense) with `@VersionColumn()` for optimistic locking.
- [x] **Task 2.3**: Implement `Transaction` entity and immutable `LedgerEntry` entity (`DEBIT` & `CREDIT`).
- [x] **Task 2.4**: Implement `IdempotencyKey` entity and `AuditLog` entity.
- [x] **Task 2.5**: Write domain enums for AccountType, TransactionType, LedgerDirection.

## Phase 3: Double-Entry Accounting Engine
- [x] **Task 3.1**: Create `AccountsService` / `TransactionsService` to calculate balance from ledger entries ($\sum \text{Debit} - \sum \text{Credit}$).
- [x] **Task 3.2**: Create `LedgerService` to validate double-entry balance equality ($\sum \text{Debits} = \sum \text{Credits}$).
- [x] **Task 3.3**: Implement `Deposit` workflow (Bank Asset $\rightarrow$ User Liability).
- [x] **Task 3.4**: Implement `P2P Transfer` workflow (Sender Liability $\rightarrow$ Receiver Liability).
- [x] **Task 3.5**: Implement `Withdrawal` workflow with system service fees.

## Phase 4: Concurrency Control & Database Locking
- [x] **Task 4.1**: Implement `Pessimistic Locking` service using TypeORM `QueryRunner` (`pessimistic_write`).
- [x] **Task 4.2**: Implement `Optimistic Locking` retrying mechanism with `@VersionColumn()`.
- [x] **Task 4.3**: Implement deadlock-free deterministic account locking order (`.sort()`).

## Phase 5: Idempotency Protection System
- [x] **Task 5.1**: Build `IdempotencyInterceptor` to check `X-Idempotency-Key` header.
- [x] **Task 5.2**: Integrate Redis atomic operations (`SETNX`, TTL expiration) & PostgreSQL fallback.
- [x] **Task 5.3**: Implement cached payload serialization and response replay for duplicate key calls.

## Phase 6: Audit Trail & Transaction Logging
- [x] **Task 6.1**: Implement `AuditService` to automatically record API actions, request metadata, and user contexts.
- [x] **Task 6.2**: Implement immutable `AuditLog` entity for security and compliance.

## Phase 7: Verification & Concurrency Stress Testing
- [x] **Task 7.1**: Build `scripts/test-concurrency.ts` simulating 20 simultaneous parallel transfers to verify zero race conditions.
- [x] **Task 7.2**: Verify double-entry accounting integrity ($\sum \text{Debits} = \sum \text{Credits}$) and idempotency deduplication.
