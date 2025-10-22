/**
 * Represents a single audit log entry
 */
export interface AuditEntry {
  /** Unique identifier for this audit entry */
  id: string;

  /** Timestamp when the action occurred */
  timestamp: Date;

  /** User who performed the action */
  userId: string;

  /** Optional user details (name, email, etc.) */
  userDetails?: Record<string, any>;

  /** The action performed (e.g., "CREATE", "UPDATE", "DELETE", "ACCESS") */
  action: string;

  /** The type of entity affected (e.g., "user", "document", "payment") */
  entityType: string;

  /** The ID of the entity affected */
  entityId: string;

  /** Previous and new values for the changed fields */
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };

  /** Additional context about the action */
  metadata?: {
    /** IP address of the user */
    ipAddress?: string;
    /** User agent string */
    userAgent?: string;
    /** Session ID */
    sessionId?: string;
    /** Request ID for tracing */
    requestId?: string;
    /** Geographic location */
    location?: string;
    /** Application version */
    appVersion?: string;
    /** Any additional context */
    [key: string]: any;
  };

  /** Whether this action was successful */
  success: boolean;

  /** Error message if the action failed */
  errorMessage?: string;

  /** Severity level of the audit entry */
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Query options for retrieving audit entries
 */
export interface AuditQueryOptions {
  /** Filter by user ID */
  userId?: string;

  /** Filter by action type */
  action?: string | string[];

  /** Filter by entity type */
  entityType?: string;

  /** Start date for the query */
  startDate?: Date;

  /** End date for the query */
  endDate?: Date;

  /** Maximum number of entries to return */
  limit?: number;

  /** Offset for pagination */
  offset?: number;

  /** Sort order */
  sortOrder?: 'asc' | 'desc';

  /** Include only successful or failed actions */
  success?: boolean;

  /** Filter by severity level */
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Audit logging service for compliance, debugging, and security.
 * Tracks all important user actions and system events for regulatory requirements
 * and forensic analysis.
 */
export interface AuditService {
  /**
   * Log a user action for audit purposes
   * @param userId - The user performing the action
   * @param action - The action being performed (e.g., "CREATE_USER", "DELETE_DOCUMENT")
   * @param entity - The entity type being acted upon (e.g., "user", "document")
   * @param entityId - The specific entity ID
   * @param changes - Optional before/after state of the entity
   * @param metadata - Additional context about the action
   */
  logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    changes?: {
      before?: Record<string, any>;
      after?: Record<string, any>;
    },
    metadata?: Record<string, any>
  ): void;

  /**
   * Get the complete audit trail for a specific entity
   * @param entityId - The ID of the entity to get audit trail for
   * @param entityType - Optional entity type to filter by
   * @returns Array of audit entries for the entity
   */
  getAuditTrail(entityId: string, entityType?: string): Promise<AuditEntry[]>;

  /**
   * Query audit logs with various filters
   * @param options - Query options for filtering and pagination
   * @returns Array of matching audit entries
   */
  queryAuditLogs(options: AuditQueryOptions): Promise<AuditEntry[]>;

  /**
   * Get audit logs for a specific user
   * @param userId - The user ID to get logs for
   * @param options - Additional query options
   * @returns Array of audit entries for the user
   */
  getUserActivity(userId: string, options?: Omit<AuditQueryOptions, 'userId'>): Promise<AuditEntry[]>;

  /**
   * Search audit logs by text
   * @param searchTerm - Text to search for in audit entries
   * @param options - Additional query options
   * @returns Array of matching audit entries
   */
  searchAuditLogs?(searchTerm: string, options?: AuditQueryOptions): Promise<AuditEntry[]>;

  /**
   * Archive old audit logs
   * @param beforeDate - Archive entries before this date
   * @returns Number of entries archived
   */
  archiveOldLogs?(beforeDate: Date): Promise<number>;

  /**
   * Export audit logs for compliance reporting
   * @param options - Query options for the export
   * @param format - Export format (e.g., "json", "csv")
   * @returns Exported data as string or buffer
   */
  exportAuditLogs?(options: AuditQueryOptions, format?: 'json' | 'csv'): Promise<string | Buffer>;

  /**
   * Verify the integrity of audit logs (for tamper detection)
   * @param startDate - Start date for verification
   * @param endDate - End date for verification
   * @returns Whether the logs are intact
   */
  verifyIntegrity?(startDate?: Date, endDate?: Date): Promise<boolean>;
}