import { AddEventHandlerService } from '../AddEventHandlerService';
import { Span, Tracer } from './trace';
export declare class NoOpAddEventHandler implements AddEventHandlerService {
    addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void;
}
