import {CSVDataReader} from "./read";

export interface ICSVDataSettings{
    separator?: string
}


export function truncateTable(reader: CSVDataReader, settings: ICSVDataSettings = {}){
    reader.cellSeparator = settings.separator || ",";
    const regexEmpty = /^\s*$/;
    var endRow: number;
    var startRow: number;
    var startCol: number = Number.MAX_VALUE;
    var endCol: number = 0;
    var found = false;
    OUT:
    while(reader.hasNext()) {
        var n = reader.next();
        while (n.hasNext()) {
            var val = n.next();
            if (!(regexEmpty.test(val))) {
                reader.index--;
                startRow = reader.index;
                endRow = reader.index;
                found = true;
                break OUT
            }
        }
    }
    if (!found){
        return null;
    }
    while (reader.hasNext()){
        var row = reader.next();
        while (row.hasNext()){
            var cell = row.next();
            if (!(regexEmpty.test(cell))) {
                startCol = Math.min(startCol, row.index - 1);
                endCol = Math.max(endCol, row.index - 1);
                endRow = reader.index - 1;
            }
        }
    }
    return {
        sr: startRow, er: endRow, sc: startCol, ec: endCol
    }
}