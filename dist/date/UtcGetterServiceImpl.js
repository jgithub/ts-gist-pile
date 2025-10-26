"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtcGetterServiceImpl = void 0;
var __1 = require("..");
var UtcGetterServiceImpl = (function () {
    function UtcGetterServiceImpl(dateProviderService) {
        this.dateProviderService = dateProviderService;
    }
    UtcGetterServiceImpl.prototype.getYyyyMmDdStringAtUtc = function () {
        return __1.dateUtil.dateToYyyyMmDdStringAtUtc(this.dateProviderService.getNow());
    };
    UtcGetterServiceImpl.prototype.getSpecifiedDateAsUtc = function (anyDate) {
        var dateAtUtc = new Date(this.dateProviderService.getNow().toUTCString());
        return dateAtUtc;
    };
    return UtcGetterServiceImpl;
}());
exports.UtcGetterServiceImpl = UtcGetterServiceImpl;
//# sourceMappingURL=UtcGetterServiceImpl.js.map