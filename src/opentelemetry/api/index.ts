export {
  trace,
  isSpanContextValid,
  registerAddEventHandler,
  unregisterAddEventHandler,
  clearAddEventHandlers,
  registerSpanEndHandler,
  unregisterSpanEndHandler,
  clearSpanEndHandlers,
  type Span,
  type SpanContext,
  type Tracer,
  type TracerProvider,
  type TraceAPI
} from './trace'
export {
  context,
  type Context,
  type ContextAPI
} from './context'
export { SpanStatusCode } from './SpanStatusCode'

// Export AddEventHandlerService interface and no-op implementation
export { type AddEventHandlerService } from '../AddEventHandlerService'
export { NoOpAddEventHandler } from './NoOpAddEventHandler'

// Export SpanEndHandlingService interface and no-op implementation
export { type SpanEndHandlingService } from '../SpanEndHandlingService'
export { NoOpSpanEndHandler } from './NoOpSpanEndHandler'