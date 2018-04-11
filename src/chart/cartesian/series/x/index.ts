/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CartesianDataTypes, ICartesianSeries, IXYSeriesSystem} from "../series";
import {IXIntervalData} from "../../../../datatypes/range";
import {IReactiveXSortedRingBuffer} from "../../../reactive/collection/ring";
import {ICartesianSeriesCollection} from "../collection/index";
import {IChartXSortedSeriesSettings, IXSortedSeriesSettings} from "./factory";
import {array} from "@reactivelib/reactive";
import {IXShapeDataRingBuffer} from "../../../data/shape/cartesian/transformer/x/update";
import {ICartesianChart, ICartesianChartSettings} from "../../index";

/**
 * A series that contains data indexed by their x-position
 */
export interface IXSortedSeries extends ICartesianSeries{

    /**
     * Contains the x-indexed data of this series.
     */
    data: IReactiveXSortedRingBuffer<IXIntervalData>;
    /**
     * @ignore
     * The aggregated data. This is the data that is visualized in the chart.
     */
    summarizedData: IReactiveXSortedRingBuffer<IXIntervalData>;
    /**
     * The type of the data this series contains
     */
    dataType: CartesianDataTypes;

}

export interface IXSeriesCollection extends ICartesianSeriesCollection{
    add(series: IXSortedSeriesSettings): IXSortedSeries;
    get(series: string): IXSortedSeries;
    remove(series: string): IXSortedSeries;
    collection: array.IReactiveArray<IXSortedSeries>;
}

export interface IXSortedSeriesSystem extends IXSortedSeries, IXYSeriesSystem{
    data: IReactiveXSortedRingBuffer<IXIntervalData>;
    summarizedData: IReactiveXSortedRingBuffer<IXIntervalData>;
    shapeData: IXShapeDataRingBuffer<any>;
}

/**
 * Settings for cartesian chart of type "x". See @rest{/support/manual/cartesian} for more info about cartesian charts.
 * @editor
 */
export interface IXChartSettings extends ICartesianChartSettings {

    type: "x";
    /**
     * @editor {preview: "id"}
     */
    series?: IXSortedSeriesSettings[] | IChartXSortedSeriesSettings | array.IReactiveArray<IXSortedSeriesSettings>;

}

export interface IXChart extends ICartesianChart {

    series: IXSeriesCollection;
    type: "x";

}
