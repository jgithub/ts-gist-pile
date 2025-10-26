import { AddEventHandlerService } from '../AddEventHandlerService';
import { SpanEndHandlingService } from '../SpanEndHandlingService';
export declare function registerAddEventHandler(handler: AddEventHandlerService): void;
export declare function unregisterAddEventHandler(handler: AddEventHandlerService): void;
export declare function clearAddEventHandlers(): void;
export declare function registerSpanEndHandler(handler: SpanEndHandlingService): void;
export declare function unregisterSpanEndHandler(handler: SpanEndHandlingService): void;
export declare function clearSpanEndHandlers(): void;
export interface SpanContext {
    traceId: string;
    spanId: string;
    traceFlags?: number;
    traceState?: string;
    isRemote?: boolean;
}
export interface Span {
    spanContext(): SpanContext;
    setAttribute(key: string, value: any): this;
    setAttributes(attributes: Record<string, any>): this;
    addEvent(name: string, attributes?: Record<string, any>, time?: Date | number): this;
    setStatus(status: {
        code: number;
        message?: string;
    }): this;
    updateName(name: string): this;
    end(endTime?: Date | number): void;
    isRecording(): boolean;
    recordException(exception: Error | string, time?: Date | number): void;
}
export interface Tracer {
    startSpan(name: string, options?: any): Span;
    startActiveSpan<F extends (span: Span) => ReturnType<F>>(name: string, fn: F): ReturnType<F>;
    startActiveSpan<F extends (span: Span) => ReturnType<F>>(name: string, options: any, fn: F): ReturnType<F>;
    startActiveSpan<F extends (span: Span) => ReturnType<F>>(name: string, options: any, context: any, fn: F): ReturnType<F>;
}
export interface TracerProvider {
    getTracer(name: string, version?: string): Tracer;
}
export interface TraceAPI {
    getTracer(name: string, version?: string): Tracer;
    getTracerProvider(): TracerProvider;
    setGlobalTracerProvider(provider: TracerProvider): TracerProvider;
    disable(): void;
    getSpan(context: any): Span | undefined;
    getActiveSpan(): Span | undefined;
    setSpan(context: any, span: Span): any;
    deleteSpan(context: any): any;
    getSpanContext(context: any): SpanContext | undefined;
    wrapSpanContext(spanContext: SpanContext): any;
}
export declare const trace: TraceAPI;
export declare function isSpanContextValid(spanContext: SpanContext): boolean;
