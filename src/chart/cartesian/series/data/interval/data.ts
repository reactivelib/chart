/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IReactiveXSortedRingBuffer, ReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXInterval, ICartesianXIntervalSetting} from "../../../../../datatypes/interval";
import csvRowToJson from "../../../../../data/csv/json";
import {ICartesianXPoint, ICartesianXPointSetting} from "../../../../../datatypes/value";
import {XSortedDataToBufferConverter} from "../convert";
import {CartesianIntervalDataType} from "./index";

class IntervalConverter extends XSortedDataToBufferConverter<ICartesianXInterval, ICartesianXIntervalSetting>{

    rawDataToData(i: number, d: ICartesianXIntervalSetting): ICartesianXInterval{
        return <ICartesianXInterval>d;
    }

    parseCSVText(text: string){
        return csvRowToJson<ICartesianXInterval>({
            hasHeader: true,
            rowToType: {
                x: "number",
                y: {
                    required: true,
                    type: "number"
                },
                ye: {
                    required: true,
                    type: "number"
                },
                l: "string",
                c: "string"
            },
            csv: text
        });
    }

}

export default function(data: CartesianIntervalDataType): IReactiveXSortedRingBuffer<ICartesianXInterval>{
    return <ReactiveXSortedRingBuffer<ICartesianXInterval>>new IntervalConverter().convert(data);
}