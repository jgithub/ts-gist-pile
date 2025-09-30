import { getLogger } from '../../log/getLogger'

const LOG = getLogger('opentelemetry.trace')

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

const tracers = new Map<string, Tracer>()
let globalTracerProvider: TracerProvider | undefined
let activeSpan: Span | undefined

export const trace: TraceAPI = {
  getTracer(name: string, version?: string): Tracer {
    const key = version ? `${name}@${version}` : name
    if (!tracers.has(key)) {
      tracers.set(key, new LoggingTracer(name))
    }
    return tracers.get(key)!
  },
  
  getTracerProvider(): TracerProvider {
    if (!globalTracerProvider) {
      globalTracerProvider = {
        getTracer: (name: string, version?: string) => trace.getTracer(name, version)
      }
    }
    return globalTracerProvider
  },
  
  setGlobalTracerProvider(provider: TracerProvider): TracerProvider {
    globalTracerProvider = provider
    return provider
  },
  
  disable(): void {
    tracers.clear()
    globalTracerProvider = undefined
    activeSpan = undefined
    LOG.info('OpenTelemetry tracing disabled')
  },
  
  getSpan(context: any): Span | undefined {
    if (context && typeof context.getValue === 'function') {
      const spanKey = Symbol.for('opentelemetry.trace.span')
      return context.getValue(spanKey) as Span | undefined
    }
    return activeSpan
  },
  
  getActiveSpan(): Span | undefined {
    return activeSpan
  },
  
  setSpan(context: any, span: Span): any {
    activeSpan = span
    if (context && typeof context.setValue === 'function') {
      const spanKey = Symbol.for('opentelemetry.trace.span')
      return context.setValue(spanKey, span)
    }
    return context
  },
  
  deleteSpan(context: any): any {
    activeSpan = undefined
    if (context && typeof context.deleteValue === 'function') {
      const spanKey = Symbol.for('opentelemetry.trace.span')
      return context.deleteValue(spanKey)
    }
    return context
  },
  
  getSpanContext(context: any): SpanContext | undefined {
    const span = this.getSpan(context)
    return span?.spanContext()
  },
  
  wrapSpanContext(spanContext: SpanContext): any {
    return spanContext
  }
}

let spanIdCounter = 0
let traceIdCounter = 0

function generateSpanId(): string {
  return (++spanIdCounter).toString(16).padStart(16, '0')
}

function generateTraceId(): string {
  return (++traceIdCounter).toString(16).padStart(32, '0')
}

class LoggingSpan implements Span {
  private _spanContext: SpanContext
  private _name: string
  private _attributes: Record<string, any> = {}
  private _status?: { code: number; message?: string }
  private _isRecording = true
  private _startTime: number

  constructor(name: string, traceId?: string, parentSpanId?: string) {
    this._name = name
    this._startTime = Date.now()
    this._spanContext = {
      traceId: traceId || generateTraceId(),
      spanId: generateSpanId(),
      traceFlags: 1
    }
    
    LOG.info(`Span started: ${name}`, {
      span_id: this._spanContext.spanId,
      trace_id: this._spanContext.traceId,
      parent_span_id: parentSpanId
    })
  }

  public spanContext(): SpanContext {
    return this._spanContext
  }

  public setAttribute(key: string, value: any): this {
    this._attributes[key] = value
    LOG.info(`Span attribute set: ${this._name}`, {
      span_id: this._spanContext.spanId,
      trace_id: this._spanContext.traceId,
      attribute_key: key,
      attribute_value: value
    })
    return this
  }

  public setAttributes(attributes: Record<string, any>): this {
    Object.assign(this._attributes, attributes)
    LOG.info(`Span attributes set: ${this._name}`, {
      span_id: this._spanContext.spanId,
      trace_id: this._spanContext.traceId,
      attributes
    })
    return this
  }

  public addEvent(name: string, attributes?: Record<string, any>, time?: Date | number): this {
    LOG.notice(`addEvent(): Span event: ${this._name}`, {
      span_id: this._spanContext.spanId,
      trace_id: this._spanContext.traceId,
      event_name: name,
      event_attributes: attributes,
      event_time: time
    })
    return this
  }

  public setStatus(status: { code: number; message?: string }): this {
    this._status = status
    LOG.info(`Span status set: ${this._name}`, {
      span_id: this._spanContext.spanId,
      trace_id: this._spanContext.traceId,
      status_code: status.code,
      status_message: status.message
    })
    return this
  }

  public updateName(name: string): this {
    const oldName = this._name
    this._name = name
    LOG.info(`Span renamed: ${oldName} -> ${name}`, {
      span_id: this._spanContext.spanId,
      trace_id: this._spanContext.traceId
    })
    return this
  }

  public end(endTime?: Date | number): void {
    if (!this._isRecording) return
    
    this._isRecording = false
    const duration = (endTime ? new Date(endTime).getTime() : Date.now()) - this._startTime
    
    LOG.info(`Span ended: ${this._name}`, {
      span_id: this._spanContext.spanId,
      trace_id: this._spanContext.traceId,
      duration_ms: duration,
      attributes: this._attributes,
      status: this._status
    })
  }

  public isRecording(): boolean {
    return this._isRecording
  }

  public recordException(exception: Error | string, time?: Date | number): void {
    const errorMessage = exception instanceof Error ? exception.message : exception
    const errorStack = exception instanceof Error ? exception.stack : undefined
    
    LOG.info(`Span exception: ${this._name}`, {
      span_id: this._spanContext.spanId,
      trace_id: this._spanContext.traceId,
      exception_message: errorMessage,
      exception_stack: errorStack,
      exception_time: time
    })
  }
}

class LoggingTracer implements Tracer {
  private _name: string
  private _currentTraceId?: string

  constructor(name: string) {
    this._name = name
  }

  public startSpan(name: string, options?: any): Span {
    const parentSpan = options?.parent || activeSpan
    const traceId = parentSpan ? parentSpan.spanContext().traceId : this._currentTraceId
    const span = new LoggingSpan(name, traceId, parentSpan?.spanContext().spanId)
    
    if (!this._currentTraceId) {
      this._currentTraceId = span.spanContext().traceId
    }
    
    return span
  }

  public startActiveSpan(...args: any[]): any {
    const name = args[0]
    let options: any = {}
    let fn: Function
    
    if (args.length === 2 && typeof args[1] === 'function') {
      fn = args[1]
    } else if (args.length === 3 && typeof args[2] === 'function') {
      options = args[1]
      fn = args[2]
    } else if (args.length === 4 && typeof args[3] === 'function') {
      options = args[1]
      fn = args[3]
    } else {
      fn = args[args.length - 1]
    }
    
    const span = this.startSpan(name, options)
    const previousActiveSpan = activeSpan
    activeSpan = span
    
    try {
      return fn(span)
    } finally {
      span.end()
      activeSpan = previousActiveSpan
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
