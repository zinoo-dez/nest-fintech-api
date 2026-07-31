# System Design & Architecture: Digital Wallet & Fintech Transaction API

## 1. System Architecture Diagram

```mermaid
graph TD
    Client[Client / Mobile App] -->|HTTP Request + X-Idempotency-Key| IdempotencyInterceptor[NestJS Idempotency Interceptor]
    
    subgraph NestJS API Layer
        IdempotencyInterceptor -->|Check Key| RedisCache[(Redis Store)]
        IdempotencyInterceptor --> WalletController[Wallet Controller]
        WalletController --> TransactionService[Transaction Core Service]
        TransactionService --> LockManager[Lock Manager / QueryRunner]
    end

    subgraph Database Layer (PostgreSQL - ACID Transaction)
        LockManager -->|1. SELECT FOR UPDATE| AccountsTable[Accounts / Wallets]
        LockManager -->|2. Check Balance| Validation[Validation & Business Rules]
        LockManager -->|3. Insert Tx & Ledger| TransactionTable[Transactions & Ledger Entries]
        LockManager -->|4. Commit Transaction| PostgresDB[(PostgreSQL DB)]
    end

    TransactionService -->|Async Audit Log| AuditService[Audit Logging Service]
    AuditService --> AuditTable[(Audit Trail Log)]
```

---

## 2. Double-Entry Bookkeeping Accounting Model

In financial accounting systems, balance is calculated using the fundamental equation:
$$\text{Assets} = \text{Liabilities} + \text{Equity}$$

Every financial transaction MUST be balanced:
$$\sum \text{Debit Amounts} = \sum \text{Credit Amounts}$$

### Account Classification Table
| Account Type | Normal Balance | Increase Direction | Decrease Direction | Example in Wallet System |
| :--- | :--- | :--- | :--- | :--- |
| **Asset** | Debit | Debit (+) | Credit (-) | System Bank Account / Reserve Account |
| **Liability** | Credit | Credit (+) | Debit (-) | Customer Wallet Balance (Money system owes user) |
| **Revenue** | Credit | Credit (+) | Debit (-) | System Service/Transfer Fees Collected |
| **Expense** | Debit | Debit (+) | Credit (-) | System Operational Cost / Cashback rewards |

### Transaction Example: Peer-to-Peer (P2P) Transfer of $100
1. **User A (Sender) Account** (`Liability`): Debit **$100** (Balance Decreases)
2. **User B (Receiver) Account** (`Liability`): Credit **$100** (Balance Increases)
- Total Debit = $100, Total Credit = $100 ($\text{Net} = 0$).

---

## 3. Database ERD & Schema Design

```mermaid
erDiagram
    USERS ||--o{ WALLETS : owns
    WALLETS ||--o{ ACCOUNTS : contains
    TRANSACTIONS ||--o{ LEDGER_ENTRIES : contains
    ACCOUNTS ||--o{ LEDGER_ENTRIES : referenced_in

    USERS {
        uuid id PK
        string email
        string fullName
        timestamp createdAt
    }

    WALLETS {
        uuid id PK
        uuid userId FK
        string currency
        enum status
        timestamp createdAt
    }

    ACCOUNTS {
        uuid id PK
        uuid walletId FK
        enum accountType "ASSET | LIABILITY | REVENUE | EXPENSE"
        decimal cachedBalance
        int version "For Optimistic Locking"
        timestamp updatedAt
    }

    TRANSACTIONS {
        uuid id PK
        string idempotencyKey FK
        enum type "DEPOSIT | TRANSFER | WITHDRAWAL"
        enum status "PENDING | POSTED | FAILED | REVERSED"
        decimal totalAmount
        string description
        timestamp createdAt
    }

    LEDGER_ENTRIES {
        uuid id PK
        uuid transactionId FK
        uuid accountId FK
        enum direction "DEBIT | CREDIT"
        decimal amount
        timestamp createdAt
    }

    IDEMPOTENCY_KEYS {
        string key PK
        string requestHash
        enum status "STARTED | COMPLETED | FAILED"
        json responseBody
        timestamp createdAt
        timestamp expiresAt
    }

    AUDIT_LOGS {
        uuid id PK
        uuid userId
        string action
        string resource
        json payload
        string ipAddress
        timestamp createdAt
    }
```

---

## 4. Database Locking & Concurrency Control

### Option A: Pessimistic Locking (`SELECT FOR UPDATE`)
Used during sensitive balance update transactions.
```typescript
// NestJS / TypeORM QueryRunner implementation snippet
const account = await queryRunner.manager.findOne(Account, {
  where: { id: accountId },
  lock: { mode: 'pessimistic_write' }, // SELECT ... FOR UPDATE
});
```
- **Pros**: Absolutely guarantees no race conditions under high concurrency.
- **Cons**: High database lock contention if transactions take too long.

### Option B: Optimistic Locking (`version` column)
Used for low-contention scenarios or distributed updates.
```typescript
@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 18, scale: 4 })
  cachedBalance: number;

  @VersionColumn()
  version: number; // Increment automatically on UPDATE
}
```
- Executed query: `UPDATE account SET cached_balance = 500, version = version + 1 WHERE id = 'xyz' AND version = 3;`
- Returns error if `affectedRows === 0`.

---

## 5. Idempotency Key Engine Design

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Interceptor as Idempotency Interceptor
    participant Redis as Redis Cache / DB
    participant Controller as Transaction Controller
    participant DB as Postgres DB

    Client->>Interceptor: POST /wallets/transfer (Header: X-Idempotency-Key)
    Interceptor->>Redis: GET key:idempotency:{key}
    alt Key Exists & Status == COMPLETED
        Redis-->>Interceptor: Return Cached Response Body
        Interceptor-->>Client: 200 OK (Cached Response)
    else Key Exists & Status == STARTED
        Redis-->>Interceptor: Locked / In Progress
        Interceptor-->>Client: 409 Conflict (Transaction in progress)
    else Key Not Found
        Interceptor->>Redis: SET key:idempotency:{key} = STARTED (NX, EX 86400)
        Interceptor->>Controller: Delegate Request Execution
        Controller->>DB: Execute ACID Ledger Transaction
        DB-->>Controller: Transaction Result
        Controller->>Interceptor: Return Result
        Interceptor->>Redis: UPDATE key:idempotency:{key} = COMPLETED + Save Response
        Interceptor-->>Client: 201 Created (Fresh Result)
    end
```
