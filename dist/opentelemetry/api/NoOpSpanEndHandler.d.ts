import { SpanEndHandlingService } from '../SpanEndHandlingService';
import { Span } from './trace';
export declare class NoOpSpanEndHandler implements SpanEndHandlingService {
    spanEndJustInvoked(span: Span): void;
}
