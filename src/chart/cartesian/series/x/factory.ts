/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CartesianDataTypes, ICartesianSeriesSettings} from "../series";
import {ICandleShapeSettings} from "../render/candle/factory";
import {IDiscreteShapeSettings} from "../render/category/shape";
import {ICartesianChartSeriesConfig} from "../collection/index";
import {IPointShapeSettings} from "../render/point/group";
import {IColumnShapeSettings} from "../render/value/column/group";
import {ILineShapeSettings} from "../render/value/line/shape";
import {IAreaShapeSettings} from "../render/value/area/shape";

export type XSeriesShapeSettings = "point" | "column" | "line" | "area" | "candle" | "discrete" |
    IPointShapeSettings | IColumnShapeSettings | ILineShapeSettings | IAreaShapeSettings | ICandleShapeSettings | IDiscreteShapeSettings;


/**
 * @editor {subtypeProperty: "dataType"}
 */
export interface IXSortedSeriesSettings extends ICartesianSeriesSettings{

    /**
     *  Defines the shape of how the data will be rendered. You can specify multiple shapes with an array
     */
    shape?: XSeriesShapeSettings[] | XSeriesShapeSettings;

    /**
     * Defines the shape of how the data will be rendered. You can specify multiple shapes with an array
     */
    dataType?: CartesianDataTypes;
}

/**
 * @editor {subtypeProperty: "dataType"}
 */
export interface IChartXSortedSeriesSettings extends ICartesianChartSeriesConfig, IXSortedSeriesSettings{

    /**
     * @editor {inherit: ["dataType"]}
     */
    series: IXSortedSeriesSettings[];

    /**
     * Defines the shape of how the data will be rendered. You can specify multiple shapes with an array
     */
    shape?: XSeriesShapeSettings[] | XSeriesShapeSettings;
    
}