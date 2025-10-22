/**
 * Metrics & Instrumentation service interface for tracking request counts,
 * latencies, success rates, and other application metrics.
 */
export interface MetricsService {
  /**
   * Increment a counter metric (e.g., request counts, error counts)
   * @param name - The metric name (e.g., "api.requests", "errors.database")
   * @param tags - Optional key-value pairs for metric dimensions
   */
  incrementCounter(name: string, tags?: Record<string, string>): void;

  /**
   * Record a gauge value - a point-in-time measurement
   * @param name - The metric name (e.g., "memory.usage", "queue.size")
   * @param value - The current value
   */
  recordGauge(name: string, value: number): void;

  /**
   * Record a value in a histogram - for tracking distributions like latencies
   * @param name - The metric name (e.g., "response.time", "payload.size")
   * @param value - The value to record
   */
  recordHistogram(name: string, value: number): void;

  /**
   * Time an async operation and record it as a histogram (latency tracking)
   * Automatically records success/failure rates based on whether the function throws
   * @param name - The metric name (e.g., "db.query.time", "api.latency")
   * @param fn - The async function to time
   * @returns The result of the function
   */
  recordTiming<T>(name: string, fn: () => Promise<T>): Promise<T>;
}