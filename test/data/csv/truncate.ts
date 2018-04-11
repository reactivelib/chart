import {truncateTable } from '../../../src/data/csv/truncate';
import {CSVDataReader} from "../../../src/data/csv/read";
import {expect} from 'chai';

describe("truncate", () => {
    it("returns truncated table", () => {
        var reader = new CSVDataReader(`, , , , 
, , 
,3,4,
, , , ,
, , ,3,`);
        var tr = truncateTable(reader);
        expect(tr).to.contain({
            sc: 1, ec: 3, sr: 2, er: 4
        });
    });

    it("empty", () => {
        var reader = new CSVDataReader(`, , , , 
, , 
,,
, , , ,
, , ,,`);
        var tr = truncateTable(reader);
        expect(tr).to.be.null;
    });
})