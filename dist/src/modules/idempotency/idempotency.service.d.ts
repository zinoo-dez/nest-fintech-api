import { Repository } from 'typeorm';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { ConfigService } from '@nestjs/config';
export declare class IdempotencyService {
    private readonly idempotencyRepo;
    private readonly configService;
    private redisClient;
    private readonly ttlSeconds;
    constructor(idempotencyRepo: Repository<IdempotencyKey>, configService: ConfigService);
    lockOrCheckKey(key: string, requestHash: string): Promise<{
        isCached: boolean;
        cachedData?: any;
    }>;
    saveResponse(key: string, responseBody: any, statusCode?: number): Promise<void>;
    releaseKey(key: string): Promise<void>;
}
