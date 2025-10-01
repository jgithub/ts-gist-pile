import { expect } from 'chai';
import { 
  trace, 
  context, 
  SpanStatusCode, 
  registerAddEventHandler,
  clearAddEventHandlers,
  NoOpAddEventHandler,
  SEMATTRS_ENDUSER_ID,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_URL,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMATTRS_DB_SYSTEM,
  SEMATTRS_DB_NAME,
  SEMATTRS_DB_STATEMENT,
  SEMATTRS_DB_OPERATION,
  ATTR_ERROR_TYPE
} from "../../src/opentelemetry/api";

describe('OpenTelemetry Facade', () => {
  // Register a no-op handler before tests and clean up after
  beforeEach(() => {
    registerAddEventHandler(new NoOpAddEventHandler());
  });
  
  afterEach(() => {
    clearAddEventHandlers();
  });
  
  describe('handler registration requirement', () => {
    it('should throw error when no handlers are registered', () => {
      // Clear handlers to test the requirement
      clearAddEventHandlers();
      
      const tracer = trace.getTracer('test-tracer');
      
      expect(() => {
        tracer.startSpan('test-span');
      }).to.throw('At least one AddEventHandler must be registered before creating spans. Call registerAddEventHandler() first.');
    });
    
    it('should allow span creation when a handler is registered', () => {
      // Clear and register a handler
      clearAddEventHandlers();
      registerAddEventHandler(new NoOpAddEventHandler());
      
      const tracer = trace.getTracer('test-tracer');
      
      expect(() => {
        const span = tracer.startSpan('test-span');
        span.end();
      }).to.not.throw();
    });
  });

  describe('trace.getTracer()', () => {
    it('should create spans with events and logging', () => {
      const tracer = trace.getTracer('my-tracer');
      const span = tracer.startSpan('my-span');
      
      span.addEvent('parentOperationStarted', {
        [SEMATTRS_ENDUSER_ID]: 'user-123',
        'startTime': Date.now(),
        'details': 'Initial phase of the operation'
      });
      
      span.end();
      
      // Verify span context is valid
      const spanContext = span.spanContext();
      expect(spanContext.traceId).to.be.a('string');
      expect(spanContext.spanId).to.be.a('string');
      expect(spanContext.traceId).to.not.equal('00000000000000000000000000000000');
      expect(spanContext.spanId).to.not.equal('0000000000000000');
    });

    it('should set attributes correctly using semantic conventions', () => {
      const tracer = trace.getTracer('test-tracer');
      const span = tracer.startSpan('test-span');
      
      span.setAttribute(SEMATTRS_ENDUSER_ID, 12345);
      span.setAttribute(SEMATTRS_HTTP_METHOD, 'POST');
      span.setAttributes({
        [SEMRESATTRS_SERVICE_NAME]: 'my-service',
        [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
        [SEMATTRS_HTTP_STATUS_CODE]: 200,
        [SEMATTRS_HTTP_URL]: 'https://api.example.com/users'
      });
      
      span.end();
      
      // Verify the span was created successfully
      expect(span.isRecording()).to.be.false; // Should be false after end()
    });

    it('should handle span status correctly', () => {
      const tracer = trace.getTracer('status-tracer');
      const span = tracer.startSpan('status-span');
      
      span.setStatus({ 
        code: SpanStatusCode.OK, 
        message: 'Operation completed successfully' 
      });
      
      span.end();
      
      const spanContext = span.spanContext();
      expect(spanContext).to.have.property('traceId');
      expect(spanContext).to.have.property('spanId');
    });

    it('should record exceptions', () => {
      const tracer = trace.getTracer('error-tracer');
      const span = tracer.startSpan('error-span');
      
      const testError = new Error('Test error message');
      span.recordException(testError);
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: 'Operation failed' 
      });
      
      span.end();
      
      expect(span.isRecording()).to.be.false;
    });

    it('should support nested spans with startActiveSpan', () => {
      const tracer = trace.getTracer('nested-tracer');
      
      const result = tracer.startActiveSpan('parent-span', (parentSpan) => {
        parentSpan.setAttribute('operation.type', 'batch');
        
        const childSpan = tracer.startSpan('child-span');
        childSpan.setAttribute('item.id', 'abc-123');
        childSpan.addEvent('processing-started');
        childSpan.end();
        
        parentSpan.setStatus({ code: SpanStatusCode.OK });
        
        return 'operation-result';
      });
      
      expect(result).to.equal('operation-result');
    });
  });

  describe('context API', () => {
    it('should create keys and manage context', () => {
      const ctx = context.active();
      const key = context.createKey('test-key');
      const newCtx = ctx.setValue(key, 'test-value');
      
      expect(newCtx.getValue(key)).to.equal('test-value');
      
      const result = context.with(newCtx, () => {
        const activeCtx = context.active();
        return activeCtx.getValue(key);
      });
      
      expect(result).to.equal('test-value');
    });

    it('should work with trace spans in context', () => {
      const tracer = trace.getTracer('context-tracer');
      const ctx = context.active();
      
      context.with(ctx, () => {
        const span = tracer.startSpan('context-aware-span');
        span.setAttribute('context.test', true);
        span.end();
        
        expect(span.spanContext().traceId).to.be.a('string');
      });
    });
  });

  describe('trace API integration', () => {
    it('should handle getActiveSpan', () => {
      // Initially no active span
      const activeSpan = trace.getActiveSpan();
      expect(activeSpan).to.be.undefined;
    });

    it('should validate span contexts', () => {
      const tracer = trace.getTracer('validation-tracer');
      const span = tracer.startSpan('validation-span');
      const spanContext = span.spanContext();
      
      // Import isSpanContextValid from the facade
      const { isSpanContextValid } = require('../../src/opentelemetry/api/trace');
      
      expect(isSpanContextValid(spanContext)).to.be.true;
      
      const invalidContext = {
        traceId: '00000000000000000000000000000000',
        spanId: '0000000000000000'
      };
      
      expect(isSpanContextValid(invalidContext)).to.be.false;
      
      span.end();
    });

    it('should support multiple tracers', () => {
      const tracer1 = trace.getTracer('service-a', '1.0.0');
      const tracer2 = trace.getTracer('service-b', '2.0.0');
      
      const span1 = tracer1.startSpan('service-a-operation');
      const span2 = tracer2.startSpan('service-b-operation');
      
      expect(span1.spanContext().spanId).to.not.equal(span2.spanContext().spanId);
      
      span1.end();
      span2.end();
    });
  });

  describe('SpanStatusCode enum', () => {
    it('should have correct values', () => {
      expect(SpanStatusCode.UNSET).to.equal(0);
      expect(SpanStatusCode.OK).to.equal(1);
      expect(SpanStatusCode.ERROR).to.equal(2);
    });
  });

  describe('Semantic Conventions (Official OpenTelemetry)', () => {
    it('should provide standard attribute names', () => {
      expect(SEMATTRS_ENDUSER_ID).to.equal('enduser.id');
      expect(SEMATTRS_HTTP_METHOD).to.equal('http.method');
      expect(SEMATTRS_HTTP_STATUS_CODE).to.equal('http.status_code');
      expect(SEMATTRS_HTTP_URL).to.equal('http.url');
      expect(SEMRESATTRS_SERVICE_NAME).to.equal('service.name');
      expect(SEMATTRS_DB_SYSTEM).to.equal('db.system');
      expect(ATTR_ERROR_TYPE).to.equal('error.type');
    });

    it('should work with span attributes using semantic conventions', () => {
      const tracer = trace.getTracer('semconv-tracer');
      const span = tracer.startSpan('database-operation');
      
      span.setAttributes({
        [SEMATTRS_DB_SYSTEM]: 'postgresql',
        [SEMATTRS_DB_NAME]: 'user_database',
        [SEMATTRS_DB_STATEMENT]: 'SELECT * FROM users WHERE id = $1',
        [SEMATTRS_DB_OPERATION]: 'SELECT',
        [SEMATTRS_ENDUSER_ID]: 'user-123'
      });
      
      span.end();
      
      expect(span.spanContext().traceId).to.be.a('string');
    });

    it('should support error handling with semantic conventions', () => {
      const tracer = trace.getTracer('error-semconv-tracer');
      const span = tracer.startSpan('failing-operation');
      
      try {
        throw new Error('Database connection failed');
      } catch (error) {
        span.recordException(error as Error);
        span.setAttributes({
          [ATTR_ERROR_TYPE]: 'DatabaseError',
          [SEMATTRS_DB_SYSTEM]: 'postgresql'
        });
        span.setStatus({ 
          code: SpanStatusCode.ERROR, 
          message: 'Database operation failed' 
        });
      }
      
      span.end();
      expect(span.isRecording()).to.be.false;
    });
  });
});