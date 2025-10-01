import { AddEventHandlerService } from '../AddEventHandlerService'
import { Span, Tracer } from './trace'
import { getLogger } from "../../log/getLogger"
import { d4l } from "../../log/logUtil"

const LOG = getLogger("NoOpAddEventHandler");
/**
 * A no-op implementation of AddEventHandlerService for testing purposes.
 * This handler does nothing when addEvent is called.
 */
export class NoOpAddEventHandler implements AddEventHandlerService {
  addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
    // No-op: does nothing
    LOG.notice(`addEvent(): Entering with tracer = ${d4l(tracer)},  span = ${d4l(span)},  name = ${d4l(name)},  attributes = ${d4l(attributes)},  time = ${d4l(time)}`);
  }
}