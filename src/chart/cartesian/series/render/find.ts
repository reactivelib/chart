/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPoint} from "../../../../geometry/point/index";
import {CanvasContext} from "../../../render/canvas/context/index";
import {ISeriesShape} from "../../../series/render/base";
import {BruteForceSeriesShapeFinder} from "../../../render/canvas/series/find/data/brute";
import {ICanvasChildShape} from "../../../render/canvas/shape/index";
import {IXYSeriesSystem} from "../series";
import {Constructor} from "@reactivelib/core";
import {SeriesShapeDataIterator} from "./data/find/iterator";
import {IIterable} from "../../../../collection/iterator/index";
import {IShapeWithData} from "../../../render/canvas/series/data/index";

export interface IShapeWithSeries extends ICanvasChildShape{
    series: IXYSeriesSystem;
}

export interface IBruteForceSeriesFindableShape extends ICanvasChildShape{
    finder: BruteForceSeriesShapeFinder<any>;
    series: IXYSeriesSystem;
}

export function createSeriesShapeBruteForceFinder(it: IIterable<IShapeWithData<any>>){
    return new BruteForceSeriesShapeFinder(it, (s: ISeriesShape) => s.getScreenBoundingBox());
}