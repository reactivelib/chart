/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import { IXSortedSeriesSettings } from "./x/factory";
import { RendererSetting } from "../../series/render/settings";
import { variable } from "@reactivelib/reactive";
import { IXYAxis } from "../axis";
import {CartesianSeries, ICartesianSeriesSettings} from "./series";
import { IXYChart } from "../xy";
import {deps, variableFactory} from "../../../config/di";
import {XYChart} from "../index";


export function defaultOrigin(shape: ICartesianSeriesSettings['shape'], dataType: string){
    var renderers = shape || "point";
    if (dataType === "point"){
        if (Array.isArray(renderers)){
            return defaultRenderersOrigin(renderers);
        }
        else {
            return rendererOrigin(renderers);
        }
    }
    return null;
}

function defaultRenderersOrigin(renderers: RendererSetting[]){
    for (var i=0; i < renderers.length; i++){
        var r = renderers[i];
        var orig = rendererOrigin(r);
        if (orig !== null){
            return orig;
        }
    }
    return null;
}

function rendererOrigin(renderer: RendererSetting){
    var type: string;
    if (typeof renderer === "string"){
        type = renderer;
    }
    else {
        type = renderer.type;
    }
    switch(type){
        case "area":
        case "column":
            if (typeof renderer === "object"){
                if ("start" in renderer){
                    return (<any>renderer).start;
                }
            }
            return 0;
        default:
            return null;
    }

}

export default function origin(chart: XYChart, settings: ICartesianSeriesSettings, globalSettings: ICartesianSeriesSettings, yAxis: variable.IVariable<IXYAxis>, series: CartesianSeries){
    var vari = variable<number>(null).listener(v => {
        if (chart.type === "xy" || yAxis.value.type === "log"){
            v.value = null;
            return;
        }
        v.value = defaultOrigin(settings.shape || globalSettings.shape, series.dataType);
    });
    series.cancels.push(vari.$r);
    return vari;
}