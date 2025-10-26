"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoOpSpanEndHandler = void 0;
var getLogger_1 = require("../../log/getLogger");
var logUtil_1 = require("../../log/logUtil");
var LOG = (0, getLogger_1.getLogger)("NoOpSpanEndHandler");
var NoOpSpanEndHandler = (function () {
    function NoOpSpanEndHandler() {
    }
    NoOpSpanEndHandler.prototype.spanEndJustInvoked = function (span) {
        LOG.debug(function () { return "spanEndJustInvoked(): Entering with span = ".concat((0, logUtil_1.d4l)(span)); });
    };
    return NoOpSpanEndHandler;
}());
exports.NoOpSpanEndHandler = NoOpSpanEndHandler;
//# sourceMappingURL=NoOpSpanEndHandler.js.map