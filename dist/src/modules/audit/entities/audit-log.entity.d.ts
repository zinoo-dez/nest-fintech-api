export declare class AuditLog {
    id: string;
    userId: string | null;
    action: string;
    resource: string;
    payload: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
}
