export declare class CsvDataExtractor {
    private readonly numHeaderRows;
    private rowsOfCells;
    private readonly headerNameToIndexMap;
    private readonly numNamedColumns;
    constructor(numHeaderRows: number, rowsOfCells: Array<Array<any>>);
    getIndexOfHeaderName(headerName: string): number;
    getDataCorrespondingToHeaderInRow(headerName: string, rowOfData: Array<any>): any;
}
