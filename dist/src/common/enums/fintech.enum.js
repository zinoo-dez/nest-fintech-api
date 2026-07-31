"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyStatus = exports.LedgerDirection = exports.TransactionStatus = exports.TransactionType = exports.AccountType = void 0;
var AccountType;
(function (AccountType) {
    AccountType["ASSET"] = "ASSET";
    AccountType["LIABILITY"] = "LIABILITY";
    AccountType["REVENUE"] = "REVENUE";
    AccountType["EXPENSE"] = "EXPENSE";
})(AccountType || (exports.AccountType = AccountType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "DEPOSIT";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["WITHDRAWAL"] = "WITHDRAWAL";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["POSTED"] = "POSTED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["REVERSED"] = "REVERSED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var LedgerDirection;
(function (LedgerDirection) {
    LedgerDirection["DEBIT"] = "DEBIT";
    LedgerDirection["CREDIT"] = "CREDIT";
})(LedgerDirection || (exports.LedgerDirection = LedgerDirection = {}));
var IdempotencyStatus;
(function (IdempotencyStatus) {
    IdempotencyStatus["STARTED"] = "STARTED";
    IdempotencyStatus["COMPLETED"] = "COMPLETED";
    IdempotencyStatus["FAILED"] = "FAILED";
})(IdempotencyStatus || (exports.IdempotencyStatus = IdempotencyStatus = {}));
//# sourceMappingURL=fintech.enum.js.map