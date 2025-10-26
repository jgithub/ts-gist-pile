"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryParseStringToArray = tryParseStringToArray;
exports.hasExactlyOneItem = hasExactlyOneItem;
exports.isPopulated = isPopulated;
exports.existsButIsEmpty = existsButIsEmpty;
function tryParseStringToArray(input) {
    if (input == null) {
        return [];
    }
    input = input.replace(/\[/g, "");
    input = input.replace(/\]/g, "");
    input = input.replace(/\"/g, "");
    input = input.replace(/\'/g, "");
    var parts = input.split(/[,;\s\t]/);
    var result = [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part.trim().length > 0) {
            var trimmedPart = part.trim();
            if (trimmedPart.length > 0) {
                result.push(trimmedPart);
            }
        }
    }
    return result;
}
function hasExactlyOneItem(input) {
    if (Array.isArray(input) && input.length == 1) {
        return true;
    }
    return false;
}
function isPopulated(input) {
    if (Array.isArray(input) && input.length > 0) {
        return true;
    }
    return false;
}
function existsButIsEmpty(input) {
    if (Array.isArray(input) && input.length === 0) {
        return true;
    }
    return false;
}
//# sourceMappingURL=arrayUtil.js.map