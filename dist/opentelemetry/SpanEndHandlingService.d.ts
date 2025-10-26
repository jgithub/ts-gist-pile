import { Span } from "./api";
export interface SpanEndHandlingService {
    spanEndJustInvoked(span: Span): void;
}
