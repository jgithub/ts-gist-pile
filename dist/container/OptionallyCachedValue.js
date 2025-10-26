"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionallyCachedValue = void 0;
var OptionallyCachedValue = (function () {
    function OptionallyCachedValue(cachedFlag, value) {
        this.cachedFlag = cachedFlag;
        this.value = value;
    }
    OptionallyCachedValue.prototype.isCached = function () {
        return this.cachedFlag;
    };
    OptionallyCachedValue.prototype.getValue = function () {
        return this.value;
    };
    return OptionallyCachedValue;
}());
exports.OptionallyCachedValue = OptionallyCachedValue;
//# sourceMappingURL=OptionallyCachedValue.js.map