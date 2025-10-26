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
exports.BadRequest400Exception = void 0;
var BadRequest400Exception = (function (_super) {
    __extends(BadRequest400Exception, _super);
    function BadRequest400Exception(msg) {
        if (msg === void 0) { msg = undefined; }
        var _this = _super.call(this, "BadRequest400Exception".concat(msg ? ': ' + msg : '')) || this;
        _this.statusCode = 400;
        Object.setPrototypeOf(_this, BadRequest400Exception.prototype);
        return _this;
    }
    return BadRequest400Exception;
}(Error));
exports.BadRequest400Exception = BadRequest400Exception;
//# sourceMappingURL=BadRequest400Exception.js.map