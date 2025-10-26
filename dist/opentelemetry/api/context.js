"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.context = void 0;
var getLogger_1 = require("../../log/getLogger");
var LOG = (0, getLogger_1.getLogger)('opentelemetry.context');
var BaseContext = (function () {
    function BaseContext(parentContext) {
        this._currentContext = parentContext ? new Map(parentContext) : new Map();
    }
    BaseContext.prototype.getValue = function (key) {
        return this._currentContext.get(key);
    };
    BaseContext.prototype.setValue = function (key, value) {
        var context = new BaseContext(this._currentContext);
        context._currentContext.set(key, value);
        return context;
    };
    BaseContext.prototype.deleteValue = function (key) {
        var context = new BaseContext(this._currentContext);
        context._currentContext.delete(key);
        return context;
    };
    return BaseContext;
}());
var activeContext = new BaseContext();
exports.context = {
    active: function () {
        return activeContext;
    },
    with: function (context, fn, thisArg) {
        var _a, _b, _c;
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var previousContext = activeContext;
        activeContext = context;
        LOG.info('Context switched', {
            previous_context_keys: Array.from(((_a = previousContext._currentContext) === null || _a === void 0 ? void 0 : _a.keys()) || []).map(function (k) { return String(k.toString()); }),
            new_context_keys: Array.from(((_b = context._currentContext) === null || _b === void 0 ? void 0 : _b.keys()) || []).map(function (k) { return String(k.toString()); })
        });
        try {
            return fn.call.apply(fn, __spreadArray([thisArg], args, false));
        }
        finally {
            activeContext = previousContext;
            LOG.info('Context restored', {
                restored_context_keys: Array.from(((_c = activeContext._currentContext) === null || _c === void 0 ? void 0 : _c.keys()) || []).map(function (k) { return String(k.toString()); })
            });
        }
    },
    bind: function (context, target) {
        return target;
    },
    disable: function () {
        activeContext = new BaseContext();
        LOG.info('Context API disabled');
    },
    createKey: function (description) {
        var key = Symbol(description);
        LOG.info('Context key created', { description: description });
        return key;
    }
};
//# sourceMappingURL=context.js.map