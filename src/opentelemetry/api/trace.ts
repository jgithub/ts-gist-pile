export interface SpanContext {
  traceId: string
  spanId: string
  traceFlags?: number
  traceState?: string
  isRemote?: boolean
}

export interface Span {
  spanContext(): SpanContext
  setAttribute(key: string, value: any): this
  setAttributes(attributes: Record<string, any>): this
  addEvent(name: string, attributes?: Record<string, any>, time?: Date | number): this
  setStatus(status: { code: number; message?: string }): this
  updateName(name: string): this
  end(endTime?: Date | number): void
  isRecording(): boolean
  recordException(exception: Error | string, time?: Date | number): void
}

export interface Tracer {
  startSpan(name: string, options?: any): Span
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    fn: F
  ): ReturnType<F>
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    options: any,
    fn: F
  ): ReturnType<F>
  startActiveSpan<F extends (span: Span) => ReturnType<F>>(
    name: string,
    options: any,
    context: any,
    fn: F
  ): ReturnType<F>
}

export interface TracerProvider {
  getTracer(name: string, version?: string): Tracer
}

export interface TraceAPI {
  getTracer(name: string, version?: string): Tracer
  getTracerProvider(): TracerProvider
  setGlobalTracerProvider(provider: TracerProvider): TracerProvider
  disable(): void
  getSpan(context: any): Span | undefined
  getActiveSpan(): Span | undefined
  setSpan(context: any, span: Span): any
  deleteSpan(context: any): any
  getSpanContext(context: any): SpanContext | undefined
  wrapSpanContext(spanContext: SpanContext): any
}

export const trace: TraceAPI = {
  getTracer(name: string, version?: string): Tracer {
    return createNoopTracer()
  },
  getTracerProvider(): TracerProvider {
    return {
      getTracer: (name: string, version?: string) => createNoopTracer()
    }
  },
  setGlobalTracerProvider(provider: TracerProvider): TracerProvider {
    return provider
  },
  disable(): void {},
  getSpan(context: any): Span | undefined {
    return undefined
  },
  getActiveSpan(): Span | undefined {
    return undefined
  },
  setSpan(context: any, span: Span): any {
    return context
  },
  deleteSpan(context: any): any {
    return context
  },
  getSpanContext(context: any): SpanContext | undefined {
    return undefined
  },
  wrapSpanContext(spanContext: SpanContext): any {
    return spanContext
  }
}

function createNoopSpan(): Span {
  return {
    spanContext(): SpanContext {
      return {
        traceId: '00000000000000000000000000000000',
        spanId: '0000000000000000',
        traceFlags: 0
      }
    },
    setAttribute(key: string, value: any) { return this },
    setAttributes(attributes: Record<string, any>) { return this },
    addEvent(name: string, attributes?: Record<string, any>, time?: Date | number) { return this },
    setStatus(status: { code: number; message?: string }) { return this },
    updateName(name: string) { return this },
    end(endTime?: Date | number) {},
    isRecording() { return false },
    recordException(exception: Error | string, time?: Date | number) {}
  }
}

function createNoopTracer(): Tracer {
  const noopSpan = createNoopSpan()
  return {
    startSpan(name: string, options?: any): Span {
      return noopSpan
    },
    startActiveSpan(...args: any[]): any {
      const fn = args[args.length - 1]
      if (typeof fn === 'function') {
        return fn(noopSpan)
      }
      return undefined
    }
  }
}

export function isSpanContextValid(spanContext: SpanContext): boolean {
  return !!(
    spanContext &&
    spanContext.traceId &&
    spanContext.spanId &&
    spanContext.traceId !== '00000000000000000000000000000000' &&
    spanContext.spanId !== '0000000000000000'
  )
}
