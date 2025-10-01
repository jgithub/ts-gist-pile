import { expect } from 'chai';
import { 
  trace, 
  registerAddEventHandler,
  registerSpanEndHandler,
  unregisterSpanEndHandler,
  clearAddEventHandlers,
  clearSpanEndHandlers,
  NoOpAddEventHandler,
  type SpanEndHandlingService,
  type Span
} from "../../src/opentelemetry/api";

describe('SpanEndHandler Callback System', () => {
  
  // Register required handlers and clear after each test
  beforeEach(() => {
    registerAddEventHandler(new NoOpAddEventHandler());
  });
  
  afterEach(() => {
    clearAddEventHandlers();
    clearSpanEndHandlers();
  });
  
  it('should call registered handler when span.end() is invoked', () => {
    let handlerCalled = false;
    let capturedSpan: Span | null = null;
    
    // Create a concrete implementation of SpanEndHandlingService
    class TestSpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        handlerCalled = true;
        capturedSpan = span;
      }
    }
    
    const handler = new TestSpanEndHandler();
    
    // Register the handler
    registerSpanEndHandler(handler);
    
    // Create a span and call end
    const tracer = trace.getTracer('test-tracer');
    const span = tracer.startSpan('test-span');
    
    span.end();
    
    // Verify the handler was called
    expect(handlerCalled).to.be.true;
    expect(capturedSpan).to.equal(span);
  });
  
  it('should call multiple registered span end handlers', () => {
    const handlersCallOrder: string[] = [];
    
    class FirstSpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        handlersCallOrder.push('first');
      }
    }
    
    class SecondSpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        handlersCallOrder.push('second');
      }
    }
    
    const handler1 = new FirstSpanEndHandler();
    const handler2 = new SecondSpanEndHandler();
    
    // Register both handlers
    registerSpanEndHandler(handler1);
    registerSpanEndHandler(handler2);
    
    // Create a span and call end
    const tracer = trace.getTracer('multi-handler-tracer');
    const span = tracer.startSpan('multi-handler-span');
    
    span.end();
    
    // Verify both handlers were called in order
    expect(handlersCallOrder).to.deep.equal(['first', 'second']);
  });
  
  it('should handle errors in span end handlers gracefully', () => {
    let goodHandlerCalled = false;
    
    class FaultySpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        throw new Error('SpanEnd handler error!');
      }
    }
    
    class GoodSpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        goodHandlerCalled = true;
      }
    }
    
    const faultyHandler = new FaultySpanEndHandler();
    const goodHandler = new GoodSpanEndHandler();
    
    // Register both handlers
    registerSpanEndHandler(faultyHandler);
    registerSpanEndHandler(goodHandler);
    
    // Create a span and call end
    const tracer = trace.getTracer('error-handler-tracer');
    const span = tracer.startSpan('error-handler-span');
    
    // This should not throw, despite the faulty handler
    expect(() => {
      span.end();
    }).to.not.throw();
    
    // Good handler should still be called
    expect(goodHandlerCalled).to.be.true;
  });
  
  it('should allow unregistering span end handlers', () => {
    let handlerCallCount = 0;
    
    class CountingSpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        handlerCallCount++;
      }
    }
    
    class AlwaysPresentSpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        // This handler stays registered to satisfy the requirement
      }
    }
    
    const countingHandler = new CountingSpanEndHandler();
    const alwaysPresentHandler = new AlwaysPresentSpanEndHandler();
    
    // Register both handlers
    registerSpanEndHandler(countingHandler);
    registerSpanEndHandler(alwaysPresentHandler);
    
    // Create a span and call end
    const tracer = trace.getTracer('unregister-tracer');
    const span1 = tracer.startSpan('span-1');
    span1.end();
    
    expect(handlerCallCount).to.equal(1);
    
    // Unregister only the counting handler (keep the always-present one)
    unregisterSpanEndHandler(countingHandler);
    
    // Create another span and call end
    const span2 = tracer.startSpan('span-2');
    span2.end();
    
    // Counting handler should not be called again
    expect(handlerCallCount).to.equal(1);
  });
  
  it('should receive span context in handler', () => {
    let receivedSpanContext: any = null;
    
    class ContextCaptureSpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        receivedSpanContext = span.spanContext();
      }
    }
    
    const handler = new ContextCaptureSpanEndHandler();
    registerSpanEndHandler(handler);
    
    // Create a span and call end
    const tracer = trace.getTracer('context-tracer');
    const span = tracer.startSpan('context-span');
    
    span.end();
    
    // Verify the handler received the correct context
    expect(receivedSpanContext).to.have.property('traceId');
    expect(receivedSpanContext).to.have.property('spanId');
    expect(receivedSpanContext.traceId).to.be.a('string');
    expect(receivedSpanContext.spanId).to.be.a('string');
  });
  
  it('should require both AddEventHandler and SpanEndHandler to be registered', () => {
    // Clear both handlers to test the requirement
    clearAddEventHandlers();
    clearSpanEndHandlers();
    
    const tracer = trace.getTracer('requirement-tracer');
    
    // Should fail when no AddEventHandler is registered
    expect(() => {
      tracer.startSpan('test-span');
    }).to.throw('At least one AddEventHandler must be registered before creating spans. Call registerAddEventHandler() first.');
    
    // Register AddEventHandler but not SpanEndHandler
    registerAddEventHandler(new NoOpAddEventHandler());
    
    // Should fail when no SpanEndHandler is registered
    expect(() => {
      tracer.startSpan('test-span');
    }).to.throw('At least one SpanEndHandler must be registered before creating spans. Call registerSpanEndHandler() first.');
    
    // Register both handlers
    class TestSpanEndHandler implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {}
    }
    registerSpanEndHandler(new TestSpanEndHandler());
    
    // Now it should work
    expect(() => {
      const span = tracer.startSpan('test-span');
      span.end();
    }).to.not.throw();
  });
  
  it('should clear all span end handlers when clearSpanEndHandlers is called', () => {
    let handler1Called = false;
    let handler2Called = false;
    
    class Handler1 implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        handler1Called = true;
      }
    }
    
    class Handler2 implements SpanEndHandlingService {
      spanEndJustInvoked(span: Span): void {
        handler2Called = true;
      }
    }
    
    // Register multiple handlers
    registerSpanEndHandler(new Handler1());
    registerSpanEndHandler(new Handler2());
    
    // Clear all span end handlers
    clearSpanEndHandlers();
    
    // Verify that creating a span now throws an error (no span end handlers registered)
    const tracer = trace.getTracer('clear-tracer');
    
    expect(() => {
      tracer.startSpan('clear-span');
    }).to.throw('At least one SpanEndHandler must be registered before creating spans. Call registerSpanEndHandler() first.');
    
    // Neither handler should have been called
    expect(handler1Called).to.be.false;
    expect(handler2Called).to.be.false;
  });
});