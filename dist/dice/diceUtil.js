"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollOneDie = rollOneDie;
exports.xTimesRollDie = xTimesRollDie;
exports.beTrueXPercentOfTheTime = beTrueXPercentOfTheTime;
function rollOneDie(numSides) {
    return Math.floor(Math.random() * (numSides) + 1);
}
function xTimesRollDie(numRolls, numSides) {
    var total = 0;
    for (var ii = 0; ii < numRolls; ii++) {
        total = total + rollOneDie(numSides);
    }
    return total;
}
function beTrueXPercentOfTheTime(percent) {
    var roll = rollOneDie(100);
    return (roll <= percent) ? true : false;
}
//# sourceMappingURL=diceUtil.js.map