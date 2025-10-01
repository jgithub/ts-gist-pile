import { AddEventHandlerService } from '../AddEventHandlerService'
import { Span, Tracer } from './trace'

/**
 * A no-op implementation of AddEventHandlerService for testing purposes.
 * This handler does nothing when addEvent is called.
 */
export class NoOpAddEventHandler implements AddEventHandlerService {
  addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
    // No-op: does nothing
  }
}