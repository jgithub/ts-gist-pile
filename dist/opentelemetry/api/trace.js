"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trace = void 0;
exports.registerAddEventHandler = registerAddEventHandler;
exports.unregisterAddEventHandler = unregisterAddEventHandler;
exports.clearAddEventHandlers = clearAddEventHandlers;
exports.registerSpanEndHandler = registerSpanEndHandler;
exports.unregisterSpanEndHandler = unregisterSpanEndHandler;
exports.clearSpanEndHandlers = clearSpanEndHandlers;
exports.isSpanContextValid = isSpanContextValid;
var getLogger_1 = require("../../log/getLogger");
var LOG = (0, getLogger_1.getLogger)('opentelemetry.trace');
var eventHandlers = [];
var spanEndHandlers = [];
function registerAddEventHandler(handler) {
    eventHandlers.push(handler);
    LOG.info("Registered AddEventHandler: ".concat(handler.constructor.name));
}
function unregisterAddEventHandler(handler) {
    var index = eventHandlers.indexOf(handler);
    if (index !== -1) {
        eventHandlers.splice(index, 1);
        LOG.info("Unregistered AddEventHandler: ".concat(handler.constructor.name));
    }
}
function clearAddEventHandlers() {
    eventHandlers.length = 0;
    LOG.info('Cleared all AddEventHandlers');
}
function registerSpanEndHandler(handler) {
    spanEndHandlers.push(handler);
    LOG.info("Registered SpanEndHandler: ".concat(handler.constructor.name));
}
function unregisterSpanEndHandler(handler) {
    var index = spanEndHandlers.indexOf(handler);
    if (index !== -1) {
        spanEndHandlers.splice(index, 1);
        LOG.info("Unregistered SpanEndHandler: ".concat(handler.constructor.name));
    }
}
function clearSpanEndHandlers() {
    spanEndHandlers.length = 0;
    LOG.info('Cleared all SpanEndHandlers');
}
var tracers = new Map();
var globalTracerProvider;
var activeSpan;
exports.trace = {
    getTracer: function (name, version) {
        var key = version ? "".concat(name, "@").concat(version) : name;
        if (!tracers.has(key)) {
            tracers.set(key, new LoggingTracer(name));
        }
        return tracers.get(key);
    },
    getTracerProvider: function () {
        if (!globalTracerProvider) {
            globalTracerProvider = {
                getTracer: function (name, version) { return exports.trace.getTracer(name, version); }
            };
        }
        return globalTracerProvider;
    },
    setGlobalTracerProvider: function (provider) {
        globalTracerProvider = provider;
        return provider;
    },
    disable: function () {
        tracers.clear();
        globalTracerProvider = undefined;
        activeSpan = undefined;
        LOG.info('OpenTelemetry tracing disabled');
    },
    getSpan: function (context) {
        if (context && typeof context.getValue === 'function') {
            var spanKey = Symbol.for('opentelemetry.trace.span');
            return context.getValue(spanKey);
        }
        return activeSpan;
    },
    getActiveSpan: function () {
        return activeSpan;
    },
    setSpan: function (context, span) {
        activeSpan = span;
        if (context && typeof context.setValue === 'function') {
            var spanKey = Symbol.for('opentelemetry.trace.span');
            return context.setValue(spanKey, span);
        }
        return context;
    },
    deleteSpan: function (context) {
        activeSpan = undefined;
        if (context && typeof context.deleteValue === 'function') {
            var spanKey = Symbol.for('opentelemetry.trace.span');
            return context.deleteValue(spanKey);
        }
        return context;
    },
    getSpanContext: function (context) {
        var span = this.getSpan(context);
        return span === null || span === void 0 ? void 0 : span.spanContext();
    },
    wrapSpanContext: function (spanContext) {
        return spanContext;
    }
};
var spanIdCounter = 0;
var traceIdCounter = 0;
function generateSpanId() {
    return (++spanIdCounter).toString(16).padStart(16, '0');
}
function generateTraceId() {
    return (++traceIdCounter).toString(16).padStart(32, '0');
}
var LoggingSpan = (function () {
    function LoggingSpan(tracer, name, traceId, parentSpanId) {
        this._attributes = {};
        this._isRecording = true;
        this._tracer = tracer;
        this._name = name;
        this._startTime = Date.now();
        this._spanContext = {
            traceId: traceId || generateTraceId(),
            spanId: generateSpanId(),
            traceFlags: 1
        };
        LOG.info("Span started: ".concat(name), {
            span_id: this._spanContext.spanId,
            trace_id: this._spanContext.traceId,
            parent_span_id: parentSpanId
        });
    }
    LoggingSpan.prototype.spanContext = function () {
        return this._spanContext;
    };
    LoggingSpan.prototype.setAttribute = function (key, value) {
        this._attributes[key] = value;
        LOG.info("Span attribute set: ".concat(this._name), {
            span_id: this._spanContext.spanId,
            trace_id: this._spanContext.traceId,
            attribute_key: key,
            attribute_value: value
        });
        return this;
    };
    LoggingSpan.prototype.setAttributes = function (attributes) {
        Object.assign(this._attributes, attributes);
        LOG.info("Span attributes set: ".concat(this._name), {
            span_id: this._spanContext.spanId,
            trace_id: this._spanContext.traceId,
            attributes: attributes
        });
        return this;
    };
    LoggingSpan.prototype.addEvent = function (name, attributes, time) {
        LOG.notice("addEvent(): Span event: ".concat(this._name), {
            span_id: this._spanContext.spanId,
            trace_id: this._spanContext.traceId,
            event_name: name,
            event_attributes: attributes,
            event_time: time
        });
        for (var _i = 0, eventHandlers_1 = eventHandlers; _i < eventHandlers_1.length; _i++) {
            var handler = eventHandlers_1[_i];
            try {
                handler.addEvent(this._tracer, this, name, attributes, time);
            }
            catch (error) {
                LOG.error("Error in AddEventHandler: ".concat(error), {
                    handler: handler.constructor.name,
                    span_id: this._spanContext.spanId,
                    trace_id: this._spanContext.traceId,
                    event_name: name
                });
            }
        }
        return this;
    };
    LoggingSpan.prototype.setStatus = function (status) {
        this._status = status;
        LOG.info("Span status set: ".concat(this._name), {
            span_id: this._spanContext.spanId,
            trace_id: this._spanContext.traceId,
            status_code: status.code,
            status_message: status.message
        });
        return this;
    };
    LoggingSpan.prototype.updateName = function (name) {
        var oldName = this._name;
        this._name = name;
        LOG.info("Span renamed: ".concat(oldName, " -> ").concat(name), {
            span_id: this._spanContext.spanId,
            trace_id: this._spanContext.traceId
        });
        return this;
    };
    LoggingSpan.prototype.end = function (endTime) {
        if (!this._isRecording)
            return;
        this._isRecording = false;
        var duration = (endTime ? new Date(endTime).getTime() : Date.now()) - this._startTime;
        LOG.info("Span ended: ".concat(this._name), {
            span_id: this._spanContext.spanId,
            trace_id: this._spanContext.traceId,
            duration_ms: duration,
            attributes: this._attributes,
            status: this._status
        });
        for (var _i = 0, spanEndHandlers_1 = spanEndHandlers; _i < spanEndHandlers_1.length; _i++) {
            var handler = spanEndHandlers_1[_i];
            try {
                handler.spanEndJustInvoked(this);
            }
            catch (error) {
                LOG.error("Error in SpanEndHandler: ".concat(error), {
                    handler: handler.constructor.name,
                    span_id: this._spanContext.spanId,
                    trace_id: this._spanContext.traceId
                });
            }
        }
    };
    LoggingSpan.prototype.isRecording = function () {
        return this._isRecording;
    };
    LoggingSpan.prototype.recordException = function (exception, time) {
        var errorMessage = exception instanceof Error ? exception.message : exception;
        var errorStack = exception instanceof Error ? exception.stack : undefined;
        LOG.info("Span exception: ".concat(this._name), {
            span_id: this._spanContext.spanId,
            trace_id: this._spanContext.traceId,
            exception_message: errorMessage,
            exception_stack: errorStack,
            exception_time: time
        });
    };
    return LoggingSpan;
}());
var LoggingTracer = (function () {
    function LoggingTracer(name) {
        this._name = name;
    }
    LoggingTracer.prototype.startSpan = function (name, options) {
        if (eventHandlers.length === 0) {
            LOG.fatal('startSpan(): No AddEventHandler registered when starting span', { tracer: this._name, span_name: name });
            throw new Error('At least one AddEventHandler must be registered before creating spans. Call registerAddEventHandler() first.');
        }
        if (spanEndHandlers.length === 0) {
            LOG.fatal('startSpan(): No SpanEndHandler registered when starting span', { tracer: this._name, span_name: name });
            throw new Error('At least one SpanEndHandler must be registered before creating spans. Call registerSpanEndHandler() first.');
        }
        var parentSpan = (options === null || options === void 0 ? void 0 : options.parent) || activeSpan;
        var traceId = parentSpan ? parentSpan.spanContext().traceId : this._currentTraceId;
        var span = new LoggingSpan(this, name, traceId, parentSpan === null || parentSpan === void 0 ? void 0 : parentSpan.spanContext().spanId);
        if (!this._currentTraceId) {
            this._currentTraceId = span.spanContext().traceId;
        }
        return span;
    };
    LoggingTracer.prototype.startActiveSpan = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var name = args[0];
        var options = {};
        var fn;
        if (args.length === 2 && typeof args[1] === 'function') {
            fn = args[1];
        }
        else if (args.length === 3 && typeof args[2] === 'function') {
            options = args[1];
            fn = args[2];
        }
        else if (args.length === 4 && typeof args[3] === 'function') {
            options = args[1];
            fn = args[3];
        }
        else {
            fn = args[args.length - 1];
        }
        var span = this.startSpan(name, options);
        var previousActiveSpan = activeSpan;
        activeSpan = span;
        try {
            return fn(span);
        }
        finally {
            span.end();
            activeSpan = previousActiveSpan;
        }
    };
    return LoggingTracer;
}());
function isSpanContextValid(spanContext) {
    return !!(spanContext &&
        spanContext.traceId &&
        spanContext.spanId &&
        spanContext.traceId !== '00000000000000000000000000000000' &&
        spanContext.spanId !== '0000000000000000');
}
//# sourceMappingURL=trace.js.map