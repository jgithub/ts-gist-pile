/**
 * Options for enqueuing a job
 */
export interface JobOptions {
  /** Priority of the job (higher = more priority) */
  priority?: number;

  /** Delay in milliseconds before the job becomes available for processing */
  delay?: number;

  /** Maximum number of retry attempts on failure */
  maxRetries?: number;

  /** Backoff multiplier for retry delays */
  backoffMultiplier?: number;

  /** Timeout in milliseconds for job execution */
  timeout?: number;

  /** Unique identifier to prevent duplicate jobs */
  uniqueId?: string;

  /** Tags for job categorization and filtering */
  tags?: string[];
}

/**
 * Job handler function type
 */
export type JobHandler<T> = (payload: T, jobId: string) => Promise<void>;

/**
 * Represents a recurring job
 */
export interface Job {
  /** Unique name for the job */
  name: string;

  /** Handler function for the job */
  handler: () => Promise<void>;

  /** Job options */
  options?: JobOptions;
}

/**
 * Background job processing service for handling async tasks like
 * email sending, report generation, cleanup tasks, and other deferred work.
 */
export interface JobQueueService {
  /**
   * Enqueue a job for asynchronous processing
   * @param jobType - Type/category of the job (e.g., "send-email", "generate-report")
   * @param payload - Data payload for the job
   * @param options - Optional job configuration
   * @returns Promise that resolves when the job is successfully enqueued
   */
  enqueue<T>(jobType: string, payload: T, options?: JobOptions): Promise<void>;

  /**
   * Register a handler to process jobs of a specific type
   * @param jobType - Type of jobs this handler processes
   * @param handler - Async function to process the job
   */
  process<T>(jobType: string, handler: JobHandler<T>): void;

  /**
   * Schedule a recurring job using cron expression
   * @param cronExpression - Cron expression (e.g., "0 0 * * *" for daily at midnight)
   * @param job - The job to run on schedule
   */
  scheduleRecurring(cronExpression: string, job: Job): void;

  /**
   * Cancel a scheduled recurring job
   * @param jobName - Name of the job to cancel
   */
  cancelRecurring?(jobName: string): void;

  /**
   * Get the status of the job queue
   * @returns Queue statistics
   */
  getStatus?(): Promise<{
    pending: number;
    active: number;
    completed: number;
    failed: number;
  }>;

  /**
   * Gracefully shutdown the job queue
   * @returns Promise that resolves when all active jobs complete
   */
  shutdown?(): Promise<void>;
}