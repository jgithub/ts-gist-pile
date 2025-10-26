"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeStringify = void 0;
var safeStringify = function (obj, indent) {
    if (indent === void 0) { indent = 0; }
    var cache = [];
    try {
        var retval = JSON.stringify(obj, function (key, value) {
            return typeof value === 'object' && value !== null
                ? cache.includes(value)
                    ? undefined
                    : cache.push(value) && value
                : value;
        }, indent);
        cache = null;
        return retval;
    }
    catch (err) {
        cache = null;
        return undefined;
    }
};
exports.safeStringify = safeStringify;
//# sourceMappingURL=safeStringify.js.map