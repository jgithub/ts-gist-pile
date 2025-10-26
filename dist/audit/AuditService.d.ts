export interface AuditEntry {
    id: string;
    timestamp: Date;
    userId: string;
    userDetails?: Record<string, any>;
    action: string;
    entityType: string;
    entityId: string;
    changes?: {
        before?: Record<string, any>;
        after?: Record<string, any>;
        fields?: string[];
    };
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
        requestId?: string;
        location?: string;
        appVersion?: string;
        [key: string]: any;
    };
    success: boolean;
    errorMessage?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
}
export interface AuditQueryOptions {
    userId?: string;
    action?: string | string[];
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
    sortOrder?: 'asc' | 'desc';
    success?: boolean;
    severity?: 'info' | 'warning' | 'error' | 'critical';
}
export interface AuditService {
    logAction(userId: string, action: string, entity: string, entityId: string, changes?: {
        before?: Record<string, any>;
        after?: Record<string, any>;
    }, metadata?: Record<string, any>): void;
    getAuditTrail(entityId: string, entityType?: string): Promise<AuditEntry[]>;
    queryAuditLogs(options: AuditQueryOptions): Promise<AuditEntry[]>;
    getUserActivity(userId: string, options?: Omit<AuditQueryOptions, 'userId'>): Promise<AuditEntry[]>;
    searchAuditLogs?(searchTerm: string, options?: AuditQueryOptions): Promise<AuditEntry[]>;
    archiveOldLogs?(beforeDate: Date): Promise<number>;
    exportAuditLogs?(options: AuditQueryOptions, format?: 'json' | 'csv'): Promise<string | Buffer>;
    verifyIntegrity?(startDate?: Date, endDate?: Date): Promise<boolean>;
}
