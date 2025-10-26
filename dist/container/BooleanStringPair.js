"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanStringPair = void 0;
var BooleanStringPair = (function () {
    function BooleanStringPair(booleanValue, stringValue) {
        this.booleanValue = booleanValue;
        this.stringValue = stringValue;
    }
    BooleanStringPair.prototype.getBooleanValue = function () {
        return this.booleanValue;
    };
    BooleanStringPair.prototype.getStringValue = function () {
        return this.stringValue;
    };
    return BooleanStringPair;
}());
exports.BooleanStringPair = BooleanStringPair;
//# sourceMappingURL=BooleanStringPair.js.map