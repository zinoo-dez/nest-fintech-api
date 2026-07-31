export declare enum AccountType {
    ASSET = "ASSET",
    LIABILITY = "LIABILITY",
    REVENUE = "REVENUE",
    EXPENSE = "EXPENSE"
}
export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    TRANSFER = "TRANSFER",
    WITHDRAWAL = "WITHDRAWAL"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    POSTED = "POSTED",
    FAILED = "FAILED",
    REVERSED = "REVERSED"
}
export declare enum LedgerDirection {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT"
}
export declare enum IdempotencyStatus {
    STARTED = "STARTED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
