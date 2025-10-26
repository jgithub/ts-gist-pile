"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recursivelyFilterPropertiesInPlace = recursivelyFilterPropertiesInPlace;
exports.recursivelyFilterPropertiesCopy = recursivelyFilterPropertiesCopy;
function recursivelyFilterPropertiesInPlace(obj, listOfPropertyNamesToRemove) {
    if (Array.isArray(obj)) {
        obj.forEach(function (item) {
            recursivelyFilterPropertiesInPlace(item, listOfPropertyNamesToRemove);
        });
    }
    else if (typeof obj === 'object' && obj != null) {
        Object.getOwnPropertyNames(obj).forEach(function (key) {
            if (listOfPropertyNamesToRemove.indexOf(key) !== -1)
                delete obj[key];
            else
                recursivelyFilterPropertiesInPlace(obj[key], listOfPropertyNamesToRemove);
        });
    }
}
function recursivelyFilterPropertiesCopy(obj, listOfPropertyNamesToRemove) {
    var clone = structuredClone(obj);
    recursivelyFilterPropertiesInPlace(clone, listOfPropertyNamesToRemove);
    return clone;
}
//# sourceMappingURL=jsonUtil.js.map