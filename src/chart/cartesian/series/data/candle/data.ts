/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import ajax from "../../../../../ajax/index";
import {transaction} from "@reactivelib/reactive";
import {IReactiveXSortedRingBuffer, ReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianDataSettings} from "../../../series/series";
import {ICartesianXCandle} from "../../../../../datatypes/candlestick";

export interface ICategoricalCandleCSVDataSettings extends ICartesianDataSettings{
    url: string;
}

function fillDataFromDataSource(data: IReactiveXSortedRingBuffer<ICartesianXCandle>, settings: ICartesianDataSettings){
    var sets = <ICategoricalCandleCSVDataSettings> settings;
    ajax({
        url: sets.url,
        result: (xhttp) => {
            if (xhttp.status === 200){
                var lines = xhttp.responseText.split("\n");
                transaction(() => {
                    for (var i=0; i < lines.length; i++){
                        var line = lines[i];
                        var r = line.split(",");
                        if (r.length === 7){
                            var x = parseFloat(r[0]);
                            var xe = parseFloat(r[1]);
                            var candle = {
                                x: i,
                                time: x,
                                xe: x,
                                open: parseFloat(r[2]),
                                high: parseFloat(r[3]),
                                low: parseFloat(r[4]),
                                close: parseFloat(r[5]),
                                volume: parseFloat(r[6])
                            }
                            if (!isNaN(candle.x)){
                                data.push(candle);
                            }
                        }
                    }
                });
            }
            else
            {
                console.log("Error "+xhttp.status);
            }
        }
    })

}

export default function(data: ICartesianXCandle[] | ReactiveXSortedRingBuffer<ICartesianXCandle> | ICartesianDataSettings): IReactiveXSortedRingBuffer<ICartesianXCandle>{
    var coll = new ReactiveXSortedRingBuffer<ICartesianXCandle>();
    if (Array.isArray(data)){
        data.forEach((d, index) => {
            if (!("x" in d)){
                (<ICartesianXCandle>d).x = index;
            }
            coll.push(d);
        });
    }
    else if ((<ICartesianDataSettings>data).type)
    {
        var s = <ICartesianDataSettings>data;
        switch (s.type){
            case "csv":
                fillDataFromDataSource(coll, <ICartesianDataSettings>s);
                break;
            default:
                throw new Error("Unknown data source type "+s.type);
        }
    }
    else {
        return <IReactiveXSortedRingBuffer<ICartesianXCandle>>data;
    }
    return coll;
}