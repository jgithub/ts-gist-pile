import { expect } from 'chai';
import { 
  trace, 
  registerAddEventHandler,
  unregisterAddEventHandler,
  clearAddEventHandlers,
  type AddEventHandlerService,
  type Span,
  type Tracer
} from "../../src/opentelemetry/api";

describe('AddEventHandler Callback System', () => {
  
  // Clear handlers after each test to avoid side effects
  afterEach(() => {
    clearAddEventHandlers();
  });
  
  it('should call registered handler when addEvent is invoked', () => {
    let handlerCalled = false;
    let capturedEventName = '';
    let capturedAttributes: Record<string, any> | undefined;
    
    // Create a concrete implementation of AddEventHandlerService
    class TestEventHandler implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        handlerCalled = true;
        capturedEventName = name;
        capturedAttributes = attributes;
      }
    }
    
    const handler = new TestEventHandler();
    
    // Register the handler
    registerAddEventHandler(handler);
    
    // Create a span and call addEvent
    const tracer = trace.getTracer('test-tracer');
    const span = tracer.startSpan('test-span');
    
    span.addEvent('test-event', { 
      key1: 'value1',
      key2: 123
    });
    
    // Verify the handler was called
    expect(handlerCalled).to.be.true;
    expect(capturedEventName).to.equal('test-event');
    expect(capturedAttributes).to.deep.equal({ 
      key1: 'value1',
      key2: 123
    });
    
    span.end();
  });
  
  it('should call multiple registered handlers', () => {
    const handlersCallOrder: string[] = [];
    
    class FirstEventHandler implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        handlersCallOrder.push('first');
      }
    }
    
    class SecondEventHandler implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        handlersCallOrder.push('second');
      }
    }
    
    const handler1 = new FirstEventHandler();
    const handler2 = new SecondEventHandler();
    
    // Register both handlers
    registerAddEventHandler(handler1);
    registerAddEventHandler(handler2);
    
    // Create a span and call addEvent
    const tracer = trace.getTracer('multi-handler-tracer');
    const span = tracer.startSpan('multi-handler-span');
    
    span.addEvent('multi-event');
    
    // Verify both handlers were called in order
    expect(handlersCallOrder).to.deep.equal(['first', 'second']);
    
    span.end();
  });
  
  it('should handle errors in event handlers gracefully', () => {
    let goodHandlerCalled = false;
    
    class FaultyEventHandler implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        throw new Error('Handler error!');
      }
    }
    
    class GoodEventHandler implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        goodHandlerCalled = true;
      }
    }
    
    const faultyHandler = new FaultyEventHandler();
    const goodHandler = new GoodEventHandler();
    
    // Register both handlers
    registerAddEventHandler(faultyHandler);
    registerAddEventHandler(goodHandler);
    
    // Create a span and call addEvent
    const tracer = trace.getTracer('error-handler-tracer');
    const span = tracer.startSpan('error-handler-span');
    
    // This should not throw, despite the faulty handler
    expect(() => {
      span.addEvent('error-event');
    }).to.not.throw();
    
    // Good handler should still be called
    expect(goodHandlerCalled).to.be.true;
    
    span.end();
  });
  
  it('should allow unregistering handlers', () => {
    let handlerCallCount = 0;
    
    class CountingEventHandler implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        handlerCallCount++;
      }
    }
    
    const handler = new CountingEventHandler();
    
    // Register the handler
    registerAddEventHandler(handler);
    
    // Create a span and call addEvent
    const tracer = trace.getTracer('unregister-tracer');
    const span1 = tracer.startSpan('span-1');
    span1.addEvent('event-1');
    span1.end();
    
    expect(handlerCallCount).to.equal(1);
    
    // Unregister the handler
    unregisterAddEventHandler(handler);
    
    // Create another span and call addEvent
    const span2 = tracer.startSpan('span-2');
    span2.addEvent('event-2');
    span2.end();
    
    // Handler should not be called again
    expect(handlerCallCount).to.equal(1);
  });
  
  it('should receive tracer and span context in handler', () => {
    let receivedTracer: Tracer | null = null;
    let receivedSpanContext: any = null;
    let receivedTime: Date | number | undefined;
    
    class ContextCaptureHandler implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        receivedTracer = tracer;
        receivedSpanContext = span.spanContext();
        receivedTime = time;
      }
    }
    
    const handler = new ContextCaptureHandler();
    registerAddEventHandler(handler);
    
    // Create a span and call addEvent with time
    const tracer = trace.getTracer('context-tracer');
    const span = tracer.startSpan('context-span');
    const eventTime = Date.now();
    
    span.addEvent('context-event', { test: true }, eventTime);
    
    // Verify the handler received the correct context
    expect(receivedTracer).to.equal(tracer);
    expect(receivedSpanContext).to.have.property('traceId');
    expect(receivedSpanContext).to.have.property('spanId');
    expect(receivedSpanContext.traceId).to.be.a('string');
    expect(receivedSpanContext.spanId).to.be.a('string');
    expect(receivedTime).to.equal(eventTime);
    
    span.end();
  });
  
  it('should clear all handlers when clearAddEventHandlers is called', () => {
    let handler1Called = false;
    let handler2Called = false;
    
    class Handler1 implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        handler1Called = true;
      }
    }
    
    class Handler2 implements AddEventHandlerService {
      addEvent(tracer: Tracer, span: Span, name: string, attributes?: Record<string, any>, time?: Date | number): void {
        handler2Called = true;
      }
    }
    
    // Register multiple handlers
    registerAddEventHandler(new Handler1());
    registerAddEventHandler(new Handler2());
    
    // Clear all handlers
    clearAddEventHandlers();
    
    // Create a span and call addEvent
    const tracer = trace.getTracer('clear-tracer');
    const span = tracer.startSpan('clear-span');
    span.addEvent('clear-event');
    
    // Neither handler should be called
    expect(handler1Called).to.be.false;
    expect(handler2Called).to.be.false;
    
    span.end();
  });
});