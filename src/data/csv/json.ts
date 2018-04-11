import {CSVDataReader} from "./read";

export type columnType = "string" | "number" | "date";

export interface IColumnTypeSettings{
    type: columnType;
    format?: string;
}

export interface ICsvToJsonParser{

    hasHeader?: boolean;
    csv: string;
    rowToType?: {[s: string]: IColumnTypeSettings | columnType};
    rowIds?: string[];

}

var stringType = {
    type: "string"
}

export default function csvRowToJson<E>(settings: ICsvToJsonParser): E[]{
    var read = new CSVDataReader(settings.csv);
    var rowIds: string[] = [];
    var rowToType = {};
    for (var key in settings.rowToType || {}){
        var rt = settings.rowToType[key];
        if (typeof rt === "string"){
            rt = {
                type: rt
            }
        }
        rowToType[key] = rt;
    }
    var i = 0;
    if (settings.hasHeader && read.hasNext()){
        var row = read.next();
        while(row.hasNext()){
            i++;
            rowIds.push(row.next());
        }
    }
    var sr = settings.rowIds || [];
    for (var k=i; k < sr.length; k++){
        rowIds.push(sr[k]);
    }
    var res: E[] = [];
    var x = 0;
    while(read.hasNext()){
        var row = read.next();
        var i = 0;
        var json: any = {
            x: x
        };
        while(row.hasNext()){
            var val = <any>row.next();
            if (val === ""){
                continue;
            }
            var key = rowIds[i];
            if (key){
                var tp = rowToType[key] || stringType;
                switch(tp.type){
                    case "number":
                        val = parseFloat(val);
                        break;
                    default:
                }
                json[key] = val;
            }
            i++;
        }
        x++;
        if ("y" in json){
            res.push(json);
        }
    }
    return res;
}