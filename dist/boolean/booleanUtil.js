"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTrueIsh = exports.isTrueLike = exports.doesImplyTrue = void 0;
exports.isTruelike = isTruelike;
function isTruelike(input) {
    if (input == null) {
        return false;
    }
    if ([
        'true', 'yes', 't', 'y', '1'
    ].includes(input.toString().trim().toLowerCase())) {
        return true;
    }
    return false;
}
exports.doesImplyTrue = isTruelike;
exports.isTrueLike = isTruelike;
exports.isTrueIsh = isTruelike;
//# sourceMappingURL=booleanUtil.js.map