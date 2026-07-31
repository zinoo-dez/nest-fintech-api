import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async logAction(data: {
    userId?: string;
    action: string;
    resource: string;
    payload?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const log = this.auditRepo.create({
      action: data.action,
      resource: data.resource,
      userId: data.userId ? data.userId : undefined,
      payload: data.payload ? data.payload : undefined,
      ipAddress: data.ipAddress ? data.ipAddress : undefined,
      userAgent: data.userAgent ? data.userAgent : undefined,
    });
    return this.auditRepo.save(log);
  }
}
