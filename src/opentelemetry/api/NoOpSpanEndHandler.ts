import { SpanEndHandlingService } from '../SpanEndHandlingService'
import { Span } from './trace'

/**
 * A no-op implementation of SpanEndHandlingService for testing purposes.
 * This handler does nothing when spanEndJustInvoked is called.
 */
export class NoOpSpanEndHandler implements SpanEndHandlingService {
  spanEndJustInvoked(span: Span): void {
    // No-op: does nothing
  }
}