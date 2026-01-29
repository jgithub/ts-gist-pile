"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIpAddress = extractIpAddress;
var getLogger_1 = require("../log/getLogger");
var logUtil_1 = require("../log/logUtil");
var LOG = (0, getLogger_1.getLogger)('request.requestUtil');
function extractIpAddress(req) {
    var _a;
    var getHeader = function (name) {
        if (req.get) {
            return req.get(name);
        }
        if (req.headers) {
            var value = req.headers[name.toLowerCase()];
            return Array.isArray(value) ? value[0] : value;
        }
        return undefined;
    };
    var forwarded = getHeader('X-Forwarded-For');
    var realIp = getHeader('X-Real-IP');
    var socketAddr = ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || null;
    LOG.debug(function () { return "extractIpAddress(): X-Forwarded-For = ".concat((0, logUtil_1.d4l)(forwarded), ",  X-Real-IP = ").concat((0, logUtil_1.d4l)(realIp), ",  socket = ").concat((0, logUtil_1.d4l)(socketAddr)); });
    if (forwarded) {
        var firstIp = forwarded.split(',')[0];
        return firstIp ? firstIp.trim() : null;
    }
    if (realIp) {
        return realIp;
    }
    return socketAddr;
}
//# sourceMappingURL=requestUtil.js.map