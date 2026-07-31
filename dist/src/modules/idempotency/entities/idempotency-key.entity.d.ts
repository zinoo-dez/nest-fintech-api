import { IdempotencyStatus } from '../../../common/enums/fintech.enum';
export declare class IdempotencyKey {
    key: string;
    requestHash: string;
    status: IdempotencyStatus;
    responseBody: Record<string, any> | null;
    statusCode: number | null;
    createdAt: Date;
    updatedAt: Date;
}
