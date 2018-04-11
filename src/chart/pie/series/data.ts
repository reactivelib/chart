import {ICartesianXPoint, IValuePoint} from "../../../datatypes/value";
import {CSVDataReader} from "../../../data/csv/read";
import {truncateTable} from "../../../data/csv/truncate";
import {ReactiveRingBuffer} from "../../reactive/collection/ring";
import {unchanged} from "@reactivelib/reactive";

export interface IPieSeriesDataSettings{

    content: string;
    type?: "text" | "link";

}

export function parseData(setting: IPieSeriesDataSettings){
    const reader = new CSVDataReader(setting.content);
    var tr = truncateTable(reader);
    if (!tr){
        return new ReactiveRingBuffer<IValuePoint>();
    }
    var datas = reader.datas;
    var header = datas[tr.sr];
    var points: IValuePoint[] = [];
    for (var i = tr.sr+1; i <= tr.er; i++){
        var data = datas[i];
        var point = <IValuePoint>{};
        for (var j = tr.sc; j <= tr.ec; j++){
            if (header[j]){
                var h = header[j];
                switch(h){
                    case "y":
                        point[h] = parseFloat(data[j]);
                        break;
                    default:
                        point[h] = data[j];
                }
            }
        }
        points.push(point);
    }
    var res = new ReactiveRingBuffer<IValuePoint>();
    unchanged(() => {
        points.forEach(p => res.push(p));
    });
    return res;
}
