"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneDeep = cloneDeep;
exports.cloneWithOverrides = cloneWithOverrides;
function cloneDeep(obj) {
    return structuredClone(obj);
}
function cloneWithOverrides(original, overrides) {
    var result = __assign(__assign({}, structuredClone(original)), overrides);
    return result;
}
//# sourceMappingURL=cloneUtil.js.map