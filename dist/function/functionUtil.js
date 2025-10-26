"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryFn = void 0;
var tryFn = function (fn) {
    try {
        return fn();
    }
    catch (e) {
        return undefined;
    }
};
exports.tryFn = tryFn;
//# sourceMappingURL=functionUtil.js.map