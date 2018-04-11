/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {buildAndFetch, IContainer, join} from "../../../config/di";
import {CartesianSeries, IXYSeriesSystem} from "./series";
import {IDataHighlightSettings} from "../../series/render/highlight";
import {IDataHighlighter} from "./render/data/highlight/highlight";
import {PointHighlighterFactories} from "./render/point/highlight/factory";
import {optional} from "@reactivelib/core";
import {XYChart} from "..";


export function xyHighlighter(series: CartesianSeries, $container: IContainer){
    var hl = <(series: IXYSeriesSystem, settings?: IDataHighlightSettings) => IDataHighlighter>buildAndFetch($container, join(PointHighlighterFactories, {
        stack: () => optional()
    }), "factory");
    return hl;
}