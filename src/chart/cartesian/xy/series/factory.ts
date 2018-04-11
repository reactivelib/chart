/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianSeriesSettings} from "../../series/series";
import {IDiscreteShapeSettings} from "../../series/render/category/shape";
import {ICartesianChartSeriesConfig} from "../../series/collection/index";
import {IPointShapeSettings} from "../../series/render/point/group";

export type XYSeriesShapeSettings = "point" | "discrete" | IPointShapeSettings | IDiscreteShapeSettings;

/**
 * @editor
 */
export interface IXYSeriesSettings extends ICartesianSeriesSettings{

    shape?: XYSeriesShapeSettings[] | XYSeriesShapeSettings;
    dataType?: "point";
}

/**
 * @editor
 */
export interface IChartXYSeriesSettings extends ICartesianChartSeriesConfig, IXYSeriesSettings{

    series: IXYSeriesSettings[];
    shape?: XYSeriesShapeSettings[] | XYSeriesShapeSettings;
    dataType?: "point";

}