"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailable503Exception = void 0;
var ServiceUnavailable503Exception = (function (_super) {
    __extends(ServiceUnavailable503Exception, _super);
    function ServiceUnavailable503Exception(msg) {
        if (msg === void 0) { msg = undefined; }
        var _this = _super.call(this, "ServiceUnavailable503Exception".concat(msg ? ': ' + msg : '')) || this;
        _this.statusCode = 503;
        Object.setPrototypeOf(_this, ServiceUnavailable503Exception.prototype);
        return _this;
    }
    return ServiceUnavailable503Exception;
}(Error));
exports.ServiceUnavailable503Exception = ServiceUnavailable503Exception;
//# sourceMappingURL=ServiceUnavailable503Exception.js.map