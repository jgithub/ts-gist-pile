"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
var Container = (function () {
    function Container() {
        this.bindings = new Map();
    }
    Container.prototype.bind = function (serviceIdentifier) {
        return new ConstantServiceBinder(this.bindings, serviceIdentifier);
    };
    Container.prototype.rebind = function (serviceIdentifier) {
        this.unbind(serviceIdentifier);
        return new ConstantServiceBinder(this.bindings, serviceIdentifier);
    };
    Container.prototype.get = function (serviceIdentifier) {
        if (!this.bindings.has(serviceIdentifier)) {
            var identifierStr = typeof serviceIdentifier === 'symbol'
                ? serviceIdentifier.toString()
                : serviceIdentifier;
            throw new Error("No binding found for service identifier: ".concat(identifierStr));
        }
        return this.bindings.get(serviceIdentifier);
    };
    Container.prototype.isBound = function (serviceIdentifier) {
        return this.bindings.has(serviceIdentifier);
    };
    Container.prototype.unbind = function (serviceIdentifier) {
        return this.bindings.delete(serviceIdentifier);
    };
    Container.prototype.unbindAll = function () {
        this.bindings.clear();
    };
    Object.defineProperty(Container.prototype, "size", {
        get: function () {
            return this.bindings.size;
        },
        enumerable: false,
        configurable: true
    });
    return Container;
}());
exports.Container = Container;
var ConstantServiceBinder = (function () {
    function ConstantServiceBinder(bindings, serviceIdentifier) {
        this.bindings = bindings;
        this.serviceIdentifier = serviceIdentifier;
    }
    ConstantServiceBinder.prototype.toConstantValue = function (value) {
        this.bindings.set(this.serviceIdentifier, value);
    };
    return ConstantServiceBinder;
}());
//# sourceMappingURL=Container.js.map