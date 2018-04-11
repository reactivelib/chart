/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianSeries} from "../../series/series";
import {IReactiveRingBuffer} from "../../../reactive/collection/ring";
import {array} from "@reactivelib/reactive";
import {ICartesianSeriesCollection} from "../../series/collection";
import {IXYSeriesSettings} from "./factory";
import {IShapeDataHolder} from "../../../data/shape/transform/index";
import {ICartesianXPoint} from "../../../../datatypes/value";
import {IArrayIterator} from "../../../../collection/iterator/array";

export interface IXY2dSeries extends ICartesianSeries{

    /**
     * Contains the x-indexed data of this series.
     */
    data: IReactiveRingBuffer<ICartesianXPoint>;
    /**
     * The type of the data this series contains
     */
    dataType: "point";

}

export interface IXYSeriesCollection extends ICartesianSeriesCollection{
    add(series: IXYSeriesSettings): IXY2dSeries;
    get(series: string): IXY2dSeries;
    remove(series: string): IXY2dSeries;
    collection: array.IReactiveArray<IXY2dSeries>;
}


export interface IShapeDataPointCollection extends IReactiveRingBuffer<IShapeDataHolder<ICartesianXPoint>>{
    iterator(): IArrayIterator<IShapeDataHolder<ICartesianXPoint>>;
}