"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getLogger_1 = require("../log/getLogger");
var logUtil_1 = require("../log/logUtil");
var getLogger_2 = require("../log/getLogger");
var api_1 = require("@opentelemetry/api");
var LOG = (0, getLogger_2.getLogger)("log.LogTester");
var tracer = api_1.trace.getTracer('log.LogTester');
var LogTester = (function () {
    function LogTester() {
    }
    LogTester.prototype.buildCar = function (make, model) {
        var _this = this;
        tracer.startActiveSpan('buildCar()', function (span) {
            console.log(span);
            var confirmSpan = api_1.trace.getSpan(api_1.context.active());
            if (confirmSpan) {
                var _a = confirmSpan.spanContext(), traceId = _a.traceId, spanId = _a.spanId;
                console.log("traceId = '".concat(traceId, "', spanId = '").concat(spanId, "'"));
            }
            else {
                console.log("No Confirmed Span");
            }
            var usernameToTrack = 'bob';
            span.setAttributes({ usernameToTrack: usernameToTrack });
            _this.doSomething();
            LOG.debug("buildCar(): Entering.", { make: make, model: model });
            LOG.debug(function () { return "buildCar(): Entering with make = ".concat((0, logUtil_1.d4l)(make)); });
            LOG.fatal("buildCar(): password = ".concat((0, logUtil_1.d4lObfuscate)("password")));
            LOG.fatal("buildCar(): password = ".concat((0, logUtil_1.d4lObfuscate)("123456789012345")));
            LOG.fatal("buildCar(): password = ".concat((0, logUtil_1.d4lObfuscate)("ABCDEFGHIJKLMNOPQRSTUVWXYZ")));
            LOG.fatal("buildCar(): password = ".concat((0, logUtil_1.d4lObfuscate)("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg")));
            LOG.fatal("buildCar(): password = ".concat((0, logUtil_1.d4lObfuscate)("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")));
        });
    };
    LogTester.prototype.doSomething = function () {
        var span = tracer.startSpan('doSomething');
        try {
            LOG.debug("doSomething(): Entering");
        }
        catch (err) {
            span.setStatus({ code: api_1.SpanStatusCode.ERROR, message: String(err) });
            throw err;
        }
        finally {
            span.end();
        }
    };
    return LogTester;
}());
(0, getLogger_1.withStoreId)('00000000-0000-0000-0000-000000000000', function () {
    var logTester = new LogTester();
    logTester.buildCar("Jeep", "Cherokee");
});
//# sourceMappingURL=LogTester.js.map