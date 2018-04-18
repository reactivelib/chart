/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IReactiveXSortedRingBuffer, ReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXPoint, ICartesianXPointSetting} from "../../../../../datatypes/value";
import csvRowToJson from "../../../../../data/csv/json";
import {XSortedDataToBufferConverter} from "../convert";
import {CartesianValueDataType} from "./index";

export type ValueCategoricalData = number | ICartesianXPointSetting;

class ValueConverter extends XSortedDataToBufferConverter<ICartesianXPoint, ValueCategoricalData>{

    rawDataToData(i: number, d: ValueCategoricalData): ICartesianXPoint{
        if (typeof d === "number"){
            return {
                x: i, y: d
            }
        }
        else
        {
            return <ICartesianXPoint>d;
        }
    }

    parseCSVText(text: string){
        return csvRowToJson<ICartesianXPoint>({
            hasHeader: true,
            rowToType: {
                x: "number",
                y: {
                    required: true,
                    type: "number"
                },
                l: "string",
                c: "string",
                r: "number"
            },
            csv: text
        });
    }

}

export default function(data: CartesianValueDataType): IReactiveXSortedRingBuffer<ICartesianXPoint>{
    return <ReactiveXSortedRingBuffer<ICartesianXPoint>>new ValueConverter().convert(data);
}