import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { IdempotencyService } from './idempotency.service';
import * as crypto from 'crypto';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['x-idempotency-key'];

    // If key is not present, proceed without idempotency interception
    if (!idempotencyKey) {
      return next.handle();
    }

    // Generate SHA-256 hash of payload + request URL to verify payload consistency
    const payloadHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(request.body || {}) + request.url)
      .digest('hex');

    const { isCached, cachedData } = await this.idempotencyService.lockOrCheckKey(
      idempotencyKey,
      payloadHash,
    );

    if (isCached) {
      // Replay cached response without executing controller handler!
      return of(cachedData);
    }

    // Attach key to request object for downstream service use
    request.idempotencyKey = idempotencyKey;

    return next.handle().pipe(
      tap(async (responseBody) => {
        // Save response body when request succeeds
        await this.idempotencyService.saveResponse(idempotencyKey, responseBody);
      }),
      catchError((err) => {
        // Release lock on error to allow client retry
        this.idempotencyService.releaseKey(idempotencyKey).catch(() => {});
        return throwError(() => err);
      }),
    );
  }
}
