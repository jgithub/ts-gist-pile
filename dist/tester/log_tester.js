"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getLogger_1 = require("../log/getLogger");
process.env.LOG_DEBUG = "true";
var LOG = (0, getLogger_1.getLogger)("log/LogTester");
var LogTester = (function () {
    function LogTester() {
    }
    LogTester.prototype.buildCar = function (make, model) {
        LOG.debug("buildCar(): Entering", { make: make, model: model });
    };
    return LogTester;
}());
var logTester = new LogTester();
logTester.buildCar("Jeep", "Cherokee");
//# sourceMappingURL=log_tester.js.map