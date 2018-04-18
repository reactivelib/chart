/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IReactiveXSortedRingBuffer, ReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXCandle, ICartesianXCandleSetting} from "../../../../../datatypes/candlestick";
import {XSortedDataToBufferConverter} from "../convert";
import csvRowToJson from "../../../../../data/csv/json";
import {CartesianCandleDataType} from "./index";

class CandleConverter extends XSortedDataToBufferConverter<ICartesianXCandle, ICartesianXCandleSetting>{

    rawDataToData(i: number, d: ICartesianXCandleSetting): ICartesianXCandle{
        return <ICartesianXCandle>d;
    }

    parseCSVText(text: string){
        return csvRowToJson<ICartesianXCandle>({
            hasHeader: true,
            rowToType: {
                x: "number",
                xe: "number",
                time: "number",
                open: {
                    required: true,
                    type: "number"
                },
                high: {
                    required: true,
                    type: "number"
                },
                cat: "number",
                low: {
                    required: true,
                    type: "number"
                },
                close: {
                    required: true,
                    type: "number"
                },
                volume: "number",
                l: "string",
                c: "string"
            },
            csv: text
        });
    }

}

export default function(data: CartesianCandleDataType): IReactiveXSortedRingBuffer<ICartesianXCandle>{
    return <ReactiveXSortedRingBuffer<ICartesianXCandle>>new CandleConverter().convert(data);
}