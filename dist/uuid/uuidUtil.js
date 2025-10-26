"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateV6 = generateV6;
exports.generateV7 = generateV7;
var uuid_1 = require("uuid");
var uuid_2 = require("uuid");
function generateV6() {
    return (0, uuid_1.v6)();
}
function generateV7() {
    return (0, uuid_2.v7)();
}
//# sourceMappingURL=uuidUtil.js.map