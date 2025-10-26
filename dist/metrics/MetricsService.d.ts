export interface MetricsService {
    incrementCounter(name: string, tags?: Record<string, string>): void;
    recordGauge(name: string, value: number): void;
    recordHistogram(name: string, value: number): void;
    recordTiming<T>(name: string, fn: () => Promise<T>): Promise<T>;
}
