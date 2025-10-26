"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoOpAddEventHandler = void 0;
var getLogger_1 = require("../../log/getLogger");
var logUtil_1 = require("../../log/logUtil");
var LOG = (0, getLogger_1.getLogger)("NoOpAddEventHandler");
var NoOpAddEventHandler = (function () {
    function NoOpAddEventHandler() {
    }
    NoOpAddEventHandler.prototype.addEvent = function (tracer, span, name, attributes, time) {
        LOG.debug(function () { return "addEvent(): Entering with tracer = ".concat((0, logUtil_1.d4l)(tracer), ",  span = ").concat((0, logUtil_1.d4l)(span), ",  name = ").concat((0, logUtil_1.d4l)(name), ",  attributes = ").concat((0, logUtil_1.d4l)(attributes), ",  time = ").concat((0, logUtil_1.d4l)(time)); });
    };
    return NoOpAddEventHandler;
}());
exports.NoOpAddEventHandler = NoOpAddEventHandler;
//# sourceMappingURL=NoOpAddEventHandler.js.map