"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=booleanUtil.js.map