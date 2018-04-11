/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IReactiveXSortedRingBuffer, ReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianDataSettings} from "../../../series/series";
import {ICartesianXPoint, ICartesianXPointSetting} from "../../../../../datatypes/value";
import {CartesianValueDataType, ICartesianValueDataSettings} from "./index";
import csvRowToJson from "../../../../../data/csv/json";
import ajax from "../../../../../ajax";
import {readTable} from "../../../data/parse";

export type ValueCategoricalData = number | ICartesianXPointSetting;

function parseText(text: string, settings: ICartesianValueDataSettings): ValueCategoricalData[]{
    switch(settings.type || "csv"){
        case "json":
            var data = <ValueCategoricalData[]>JSON.parse("("+text+")");
            return data;
        default:
            return csvRowToJson({
                hasHeader: true,
                rowToType: {
                    x: "number",
                    y: "number",
                    l: "string",
                    c: "string",
                    r: "number"
                },
                csv: text
            })
    }
}

function fillArray(coll: ReactiveXSortedRingBuffer<ICartesianXPoint>, data: ValueCategoricalData[]){
    var mustSort = false;
    var lastX = -Number.MAX_VALUE;
    data.forEach((d, index) => {
        if (typeof d === "number"){
            if (index < lastX){
                mustSort = true;
            }
            lastX = index;
            coll.push({
                x: index,
                y: d
            })
        }
        else {
            if (!("x" in d)){
                d.x = index;
            }
            if (d.x < lastX){
                mustSort = true;
            }
            lastX = d.x;
            coll.push(<ICartesianXPoint><any>d);
        }
    });
    if (mustSort){
        coll.buffer.array.sort((a, b) => {
            return a.x - b.x;
        });
    }
}

export default function(data: CartesianValueDataType): IReactiveXSortedRingBuffer<ICartesianXPoint>{
    var coll = new ReactiveXSortedRingBuffer<ICartesianXPoint>();
    if (Array.isArray(data)){
        fillArray(coll, data);
    }
    else if ("content" in data)
    {
        var s = <ICartesianValueDataSettings>data;
        switch (s.source || "local"){
            case "link":
                ajax({
                    url: s.content,
                    result: (resp) => {
                        var response = resp.responseText;
                        fillArray(coll, parseText(response, s));
                    }
                });
                break;
            default:
                fillArray(coll, parseText(s.content, s));
        }
    }
    else {
        return <IReactiveXSortedRingBuffer<ICartesianXPoint>>data;
    }
    return coll;
}