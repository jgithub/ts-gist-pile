"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvDataExtractor = void 0;
var __1 = require("..");
var CsvDataExtractor = (function () {
    function CsvDataExtractor(numHeaderRows, rowsOfCells) {
        this.numHeaderRows = numHeaderRows;
        this.rowsOfCells = rowsOfCells;
        this.headerNameToIndexMap = new Map();
        if (!Array.isArray(rowsOfCells)) {
            throw new Error("Invalid Rows-of-Cells");
        }
        var numRows = rowsOfCells.length;
        var mostRelevantRowIndex = numHeaderRows - 1;
        var headerRowOfCells = rowsOfCells[mostRelevantRowIndex];
        if (!Array.isArray(headerRowOfCells)) {
            throw new Error("Invalid Header-Row-of-Cells");
        }
        this.numNamedColumns = headerRowOfCells.length;
        for (var ii = 0; ii < this.numNamedColumns; ++ii) {
            var headerName = headerRowOfCells[ii];
            if (__1.stringUtil.isBlank(headerName)) {
                throw new Error("Header column missing a name");
            }
            if (this.headerNameToIndexMap.has(headerName)) {
                throw new Error("Duplicate header: ".concat(headerName));
            }
            this.headerNameToIndexMap.set(headerName, ii);
        }
    }
    CsvDataExtractor.prototype.getIndexOfHeaderName = function (headerName) {
        var retval = this.headerNameToIndexMap.get(headerName);
        if (typeof retval === 'undefined') {
            throw new Error("No column matching headerName = ".concat(headerName));
        }
        return retval;
    };
    CsvDataExtractor.prototype.getDataCorrespondingToHeaderInRow = function (headerName, rowOfData) {
        if (!Array.isArray(rowOfData)) {
            throw new Error("Invalid row of data");
        }
        var index = this.getIndexOfHeaderName(headerName);
        return rowOfData[index];
    };
    return CsvDataExtractor;
}());
exports.CsvDataExtractor = CsvDataExtractor;
//# sourceMappingURL=CsvDataExtractor.js.map