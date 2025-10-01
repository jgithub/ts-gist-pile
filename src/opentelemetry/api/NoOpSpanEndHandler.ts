import { SpanEndHandlingService } from '../SpanEndHandlingService'
import { Span } from './trace'
import { getLogger } from "../../log/getLogger"
import { d4l } from "../../log/logUtil"

const LOG = getLogger("NoOpSpanEndHandler");

/**
 * A no-op implementation of SpanEndHandlingService for testing purposes.
 * This handler does nothing when spanEndJustInvoked is called.
 */
export class NoOpSpanEndHandler implements SpanEndHandlingService {
  public spanEndJustInvoked(span: Span): void {
    // No-op: does nothing
    LOG.debug(() => `spanEndJustInvoked(): Entering with span = ${d4l(span)}`);
  }
}