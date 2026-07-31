import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
export declare class AuditService {
    private readonly auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    logAction(data: {
        userId?: string;
        action: string;
        resource: string;
        payload?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<AuditLog>;
}
