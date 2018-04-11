/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {assemble, deps, IContainer} from "../../../../config/di";
import {CartesianSeries, ICartesianSeriesSettings} from "../series";
import {ICancellable, procedure} from "@reactivelib/reactive";
import {XYChart} from "../..";
import {IOptional} from "@reactivelib/core";
import {IntervalGroupSeriesRenderer} from "./interval/factory";
import {CandleGroupSeriesRenderer} from "./candle/factory";
import {ValueGroupSeriesRenderer} from "./value/factory";
import {GroupSeriesRenderer} from "../../../series/render/group";
import {XYPointSeriesRenderer} from "../../xy/series/render";

export default function render(chart: XYChart, series: CartesianSeries, settings: ICartesianSeriesSettings, globalSettings: ICartesianSeriesSettings,
    $container: IContainer, stack: IOptional<any>): any{
    series.starter.add(() => {
        var last: ICancellable = null;
        var proc = procedure(() => {
            stack.present;
            last && last.cancel();
            if (chart.type == "xy"){
                rend = new XYPointSeriesRenderer();
                assemble({
                    instance: rend,
                    parent: $container
                });
                last = rend;
                series.renderer = rend;
            }
            else{
                switch(series.dataType){
                    case "point":
                    var rend: GroupSeriesRenderer = new ValueGroupSeriesRenderer();
                    series.renderer = rend;
                    assemble({
                        instance: series.renderer,
                        parent: $container
                    });
                    last = rend;
                    break;
                    case "interval":
                    rend = new IntervalGroupSeriesRenderer();
                    assemble({
                        instance: rend,
                        parent: $container
                    });
                    series.renderer = rend;
                    last = rend;
                    break;
                    case "candle":
                    rend = new CandleGroupSeriesRenderer();
                    assemble({
                        instance: rend,
                        parent: $container
                    });
                    series.renderer = rend;
                    last = rend;
                    break;
                }
                
            }
        });
        return {
            cancel: () => {
                proc.cancel();
                if (last){
                    last.cancel();
                }
            }
        };
    });
    return null;
}

deps(render, ["chart", "series", "settings", "globalSettings", "$container", "stack"]);