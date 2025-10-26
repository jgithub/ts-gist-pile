"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectIdFinder = void 0;
var uuid_1 = require("uuid");
var OptionallyCachedValue_1 = require("../container/OptionallyCachedValue");
var ObjectIdFinder = (function () {
    function ObjectIdFinder() {
    }
    ObjectIdFinder.genget = function (obj) {
        var objectId = ObjectIdFinder._mapOfObjectIds.get(obj);
        if (objectId != null) {
            return new OptionallyCachedValue_1.OptionallyCachedValue(true, objectId);
        }
        else {
            objectId = (0, uuid_1.v6)();
            ObjectIdFinder._mapOfObjectIds.set(obj, objectId);
            return new OptionallyCachedValue_1.OptionallyCachedValue(false, objectId);
        }
    };
    ObjectIdFinder.gengetObjectId = function (obj) {
        var pair = ObjectIdFinder.genget(obj);
        return pair.getValue();
    };
    ObjectIdFinder._mapOfObjectIds = new WeakMap();
    return ObjectIdFinder;
}());
exports.ObjectIdFinder = ObjectIdFinder;
//# sourceMappingURL=ObjectIdFinder.js.map