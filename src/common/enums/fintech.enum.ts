export enum AccountType {
  ASSET = 'ASSET',         // System bank reserve / Cash accounts
  LIABILITY = 'LIABILITY', // Customer wallet balances (money owed to users)
  REVENUE = 'REVENUE',     // System fee income
  EXPENSE = 'EXPENSE',     // Cashback / Operational expenses
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',     // Bank Asset -> User Liability
  TRANSFER = 'TRANSFER',   // User Liability -> User Liability
  WITHDRAWAL = 'WITHDRAWAL', // User Liability -> Bank Asset (+ System Revenue)
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum LedgerDirection {
  DEBIT = 'DEBIT',   // Increases Assets/Expenses, Decreases Liabilities/Revenue
  CREDIT = 'CREDIT', // Increases Liabilities/Revenue, Decreases Assets/Expenses
}

export enum IdempotencyStatus {
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
