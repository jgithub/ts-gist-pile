import { Span, Tracer } from "./api";

export interface AddEventHandlerService {
  addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void
}