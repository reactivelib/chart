/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IChartXSortedSeriesSettings, IXSortedSeriesSettings} from "../factory";
import {IReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianXPoint} from "../../../../../datatypes/value";
import {IDiscreteShapeSettings} from "../../render/category/shape";
import {ValueCategoricalData} from "../../data/value/data";
import {CartesianValueDataType} from "../../data/value";
import {IPointShapeSettings} from "../../render/point/group";
import {IAreaShapeSettings} from "../../render/value/area/shape";
import {IColumnShapeSettings} from "../../render/value/column/group";
import {ILineShapeSettings} from "../../render/value/line/shape";

export type XValueSeriesShapeSettings = "point" | "discrete" | "area" | "line" | "column"
    | IPointShapeSettings | IDiscreteShapeSettings | IAreaShapeSettings | IColumnShapeSettings | ILineShapeSettings;


/**
 * @editor
 */
export interface IXSortedValueSeriesSettings extends IXSortedSeriesSettings{
    /**
     * @editor {type: "x.series.value"}
     */
    data?: CartesianValueDataType;
    dataType: "point";
    /**
     * @editor {type: "unionArray", constantObject: "type"}
     */
    shape?: XValueSeriesShapeSettings | XValueSeriesShapeSettings[];
}

/**
 * @editor
 */
export interface IChartXSortedValueSeriesSettings extends  IChartXSortedSeriesSettings, IXSortedValueSeriesSettings{
    data?: ValueCategoricalData[] | IReactiveXSortedRingBuffer<ICartesianXPoint>;
    dataType: "point";
    shape?: XValueSeriesShapeSettings;
}