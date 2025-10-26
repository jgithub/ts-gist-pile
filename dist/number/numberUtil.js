"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryAsNumber = tryAsNumber;
exports.ensureNumber = ensureNumber;
function tryAsNumber(input) {
    if (typeof input == 'number') {
        return input;
    }
    else if (typeof input == 'undefined') {
        return undefined;
    }
    else if (input == null) {
        return null;
    }
    else if (typeof input == 'string') {
        var workingInput = input.trim();
        if (workingInput.length > 0 &&
            !isNaN(workingInput)) {
            try {
                return parseFloat(input);
            }
            catch (err) {
            }
        }
    }
    return undefined;
}
function ensureNumber(input) {
    if (typeof input == 'number') {
        return input;
    }
    else if (typeof input == 'string') {
        var workingInput = input.trim();
        if (workingInput.length > 0 &&
            !isNaN(workingInput)) {
            try {
                return parseFloat(input);
            }
            catch (err) {
                throw err;
            }
        }
    }
    throw new Error("Not a number");
}
//# sourceMappingURL=numberUtil.js.map