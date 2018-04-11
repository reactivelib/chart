/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICandlestick, ICartesianXCandle, ICartesianXCandleSetting} from "../../../../../datatypes/candlestick";
import {IChartXSortedSeriesSettings, IXSortedSeriesSettings} from "../../../series/x/factory";
import {IReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICandleShapeSettings} from "../../render/candle/factory";

function candlestickDataBoundingBox(data: ICandlestick){
    return {
        start: data.low,
        size: data.high - data.low
    }
}

export type XCandleSeriesShapeSettings = "candle" | ICandleShapeSettings;

/**
 * @editor
 */
export interface IXSortedCandleSeriesSettings extends IXSortedSeriesSettings{
    data?: ICartesianXCandleSetting[] | IReactiveXSortedRingBuffer<ICartesianXCandle>;
    dataType: "candle";
    shape?: XCandleSeriesShapeSettings;
}

/**
 * @editor
 */
export interface IChartXSortedCandleSeriesSettings extends  IChartXSortedSeriesSettings, IXSortedCandleSeriesSettings{
    data?: ICartesianXCandleSetting[] | IReactiveXSortedRingBuffer<ICartesianXCandle>;
    dataType: "candle";
    shape?: XCandleSeriesShapeSettings;
}
