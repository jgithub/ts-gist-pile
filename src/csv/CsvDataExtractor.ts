import { stringUtil } from "..";

export class CsvDataExtractor {
  private readonly headerNameToIndexMap: Map<string, number> = new Map();
  private readonly numNamedColumns: number;

  constructor(private readonly numHeaderRows: number, private rowsOfCells: Array<Array<any>>) {
    if (!Array.isArray(rowsOfCells)) {
      throw new Error("Invalid Rows-of-Cells")
    }

    const numRows = rowsOfCells.length

    const mostRelevantRowIndex = numHeaderRows - 1;
    const headerRowOfCells = rowsOfCells[mostRelevantRowIndex];
    

    if (!Array.isArray(headerRowOfCells)) {
      throw new Error("Invalid Header-Row-of-Cells")
    }

    this.numNamedColumns = headerRowOfCells.length

    for (let ii = 0; ii < this.numNamedColumns; ++ii) {
      const headerName = headerRowOfCells[ii]
      if (stringUtil.isBlank(headerName)) {
        throw new Error("Header column missing a name")
      }
      if (this.headerNameToIndexMap.has(headerName)) {
        throw new Error(`Duplicate header: ${headerName}`)
      }
      this.headerNameToIndexMap.set(headerName, ii)
    }
  }

  public getIndexOfHeaderName(headerName: string): number {
    const retval: number | undefined = this.headerNameToIndexMap.get(headerName);
    if (typeof retval === 'undefined') {
      throw new  Error(`No column matching headerName = ${headerName}`)
    } 
    return retval;
  }

  public getDataCorrespondingToHeaderInRow(headerName: string, rowOfData: Array<any>): any {
    if (!Array.isArray(rowOfData)) {
      throw new Error("Invalid row of data")
    }
    const index = this.getIndexOfHeaderName(headerName);
    return rowOfData[index];
  }  
}