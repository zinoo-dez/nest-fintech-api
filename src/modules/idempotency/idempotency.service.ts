import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from './entities/idempotency-key.entity';
import { IdempotencyStatus } from '../../common/enums/fintech.enum';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdempotencyService {
  private redisClient: Redis | null = null;
  private readonly ttlSeconds: number;

  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyRepo: Repository<IdempotencyKey>,
    private readonly configService: ConfigService,
  ) {
    this.ttlSeconds = this.configService.get<number>('IDEMPOTENCY_TTL_SECONDS', 86400);

    try {
      this.redisClient = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });
      this.redisClient.connect().catch(() => {
        console.warn('⚠️ Redis server offline, falling back to PostgreSQL for Idempotency tracking.');
        this.redisClient = null;
      });
    } catch {
      this.redisClient = null;
    }
  }

  async lockOrCheckKey(key: string, requestHash: string): Promise<{ isCached: boolean; cachedData?: any }> {
    if (this.redisClient) {
      const redisData = await this.redisClient.get(`idempotency:${key}`);
      if (redisData) {
        const parsed = JSON.parse(redisData);
        if (parsed.status === IdempotencyStatus.COMPLETED) {
          return { isCached: true, cachedData: parsed.responseBody };
        }
        if (parsed.status === IdempotencyStatus.STARTED) {
          throw new ConflictException('A transaction with this Idempotency Key is already processing.');
        }
      }
      await this.redisClient.set(
        `idempotency:${key}`,
        JSON.stringify({ status: IdempotencyStatus.STARTED, requestHash }),
        'EX',
        this.ttlSeconds,
      );
    }

    let record = await this.idempotencyRepo.findOne({ where: { key } });

    if (record) {
      if (record.status === IdempotencyStatus.COMPLETED) {
        return { isCached: true, cachedData: record.responseBody };
      }
      if (record.status === IdempotencyStatus.STARTED) {
        throw new ConflictException('A transaction with this Idempotency Key is currently processing.');
      }
    }

    record = this.idempotencyRepo.create({
      key,
      requestHash,
      status: IdempotencyStatus.STARTED,
    });
    await this.idempotencyRepo.save(record);

    return { isCached: false };
  }

  async saveResponse(key: string, responseBody: any, statusCode = 201): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.set(
        `idempotency:${key}`,
        JSON.stringify({
          status: IdempotencyStatus.COMPLETED,
          responseBody,
          statusCode,
        }),
        'EX',
        this.ttlSeconds,
      );
    }

    await this.idempotencyRepo.update(key, {
      status: IdempotencyStatus.COMPLETED,
      responseBody,
      statusCode,
    });
  }

  async releaseKey(key: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(`idempotency:${key}`);
    }
    await this.idempotencyRepo.delete(key);
  }
}
