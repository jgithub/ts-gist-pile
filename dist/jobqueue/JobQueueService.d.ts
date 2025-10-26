export interface JobOptions {
    priority?: number;
    delay?: number;
    maxRetries?: number;
    backoffMultiplier?: number;
    timeout?: number;
    uniqueId?: string;
    tags?: string[];
}
export type JobHandler<T> = (payload: T, jobId: string) => Promise<void>;
export interface Job {
    name: string;
    handler: () => Promise<void>;
    options?: JobOptions;
}
export interface JobQueueService {
    enqueue<T>(jobType: string, payload: T, options?: JobOptions): Promise<void>;
    process<T>(jobType: string, handler: JobHandler<T>): void;
    scheduleRecurring(cronExpression: string, job: Job): void;
    cancelRecurring?(jobName: string): void;
    getStatus?(): Promise<{
        pending: number;
        active: number;
        completed: number;
        failed: number;
    }>;
    shutdown?(): Promise<void>;
}
