/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IChartXSortedSeriesSettings, IXSortedSeriesSettings} from "../factory";
import {IReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXInterval, ICartesianXIntervalSetting} from "../../../../../datatypes/interval";
import {IColumnShapeSettings} from "../../render/value/column/group";
import {IAreaShapeSettings} from "../../render/value/area/shape";

export function getIntervalDataBoundingBox(data: ICartesianXInterval){
    return {
        start: data.y,
        size: data.ye - data.y
    }
}

export type XIntervalSeriesShapeSettings = "column" | "area" | IColumnShapeSettings | IAreaShapeSettings;

/**
 * @editor
 */
export interface IXSortedIntervalSeriesSettings extends IXSortedSeriesSettings{
    data?: ICartesianXIntervalSetting[] | IReactiveXSortedRingBuffer<ICartesianXInterval>;
    dataType: "interval";
    shape?: XIntervalSeriesShapeSettings;
}

/**
 * @editor
 */
export interface IChartXSortedIntervalSeriesSettings extends  IChartXSortedSeriesSettings, IXSortedIntervalSeriesSettings{
    data?: ICartesianXIntervalSetting[] | IReactiveXSortedRingBuffer<ICartesianXInterval>;
    dataType: "interval";
    shape?: XIntervalSeriesShapeSettings;
}