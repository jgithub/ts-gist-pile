import { expect } from 'chai';
import { CsvDataExtractor } from "../../src/index";
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';

describe('CsvDataExtractor', () => {
  describe('on a sunny day', () => {
    it('works', async () => {
      const fileContents = fs.readFileSync(path.resolve(__dirname, `../fixture/translations.csv`));
      const parser = parse(fileContents, { bom: true })
      const rowsOfCells = await parser.toArray();
      const csvDataExtractor = new CsvDataExtractor(2, rowsOfCells)
      expect(csvDataExtractor.getIndexOfHeaderName("key")).to.eq(0)
      expect(csvDataExtractor.getIndexOfHeaderName("it")).to.eq(2)
      expect(csvDataExtractor.getDataCorrespondingToHeaderInRow("en", rowsOfCells[2])).to.eql("hello");
      expect(csvDataExtractor.getDataCorrespondingToHeaderInRow("en-us", rowsOfCells[2])).to.eql("howdy");
      expect(csvDataExtractor.getDataCorrespondingToHeaderInRow("it", rowsOfCells[2])).to.eql("ciao");

    })  
  })
})