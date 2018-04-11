/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianChart, ICartesianChartSettings, XYChart} from "../../index";
import {IXYAxis, XYAxisSystem} from "../index";
import {AxisCollection} from "./index";
import {IChartAxisSettings, IDomainOffsetSettings, IMaximizedDomainSettings} from "./factory";
import {IPointInterval} from "../../../../geometry/interval/index";
import {procedure} from "@reactivelib/reactive";
import calculateOffset, {createSizeGetterByYCoordinateOrigin} from "../../../../math/domain/maximize/offset";
import {ReactivePointInterval} from "../../../reactive/geometry/interval";
import {IXChartSettings} from "../../series/x/index";
import {extend} from "@reactivelib/core";
import {variable} from "@reactivelib/reactive";
import {IChartXSortedSeriesSettings, IXSortedSeriesSettings} from "../../series/x/factory";
import {deps, variableFactory} from "../../../../config/di/index";
import {defaultOrigin} from "../../series/origin";
import {array} from "@reactivelib/reactive";


function guessOrigin(settings: IXChartSettings){
    if (!settings.series){
        return false;
    }
    var sers: IXSortedSeriesSettings[] = [];
    var parent: IChartXSortedSeriesSettings = <any>{};    
    if (Array.isArray(settings.series) || array.isReactiveArray(settings.series)){
        sers = array.getNativeArray(<IXSortedSeriesSettings[]>settings.series);
    }
    else {
        parent = <IChartXSortedSeriesSettings>settings.series;
        sers = array.getNativeArray(parent.series) || [];
    }
    for (var i=0; i < sers.length; i++){
        var s = sers[i];
        var orig = defaultOrigin(s.shape || parent.shape, s.dataType || parent.dataType || "point");
        if (orig !== null){
            return true;
        }
    }
    var d = settings.data;
    if (d){
        var sap = (<IChartXSortedSeriesSettings> settings.series).shape;
        if (sap === "column" || sap === "area"){
            return true;
        }
    }
    return false;
}


export function offsetSettings(axesSettings: IChartAxisSettings,
                               primary: variable.IVariable<IXYAxis>,
                               axes: AxisCollection,
                               axisCoordinate: string,
                               chart: ICartesianChart,
                               chartSettings: ICartesianChartSettings): variable.IVariable<IDomainOffsetSettings>{
    var defaultOffset = variable<IDomainOffsetSettings>(null).listener(v => {
        if (primary.value.type === "log"){
            v.value = {start: "50%", end: "200%"};
        }
        else if (primary.value.type === "discrete"){
            v.value = {start:0, end: 0};
        }
        else{
            var start: any = "5%";
            var end: any = "5%";
            if (axisCoordinate === "y" && chart.type === "x"){
                if (guessOrigin(<IXChartSettings>chartSettings)){
                    start = 0;
                }
            }
            if (axisCoordinate === "x" && chart.type === "x"){
                start = 0;
                end = 0;
            }
            v.value = {
                start: start,
                end: end
            }
        }
        if (axesSettings.maxWindow && typeof axesSettings.maxWindow === "object"){
            var offset = (<IMaximizedDomainSettings>axesSettings.maxWindow).offset;
            if (!offset){
                return;
            }
            if (typeof offset === "object"){
                v.value = extend(v.value, offset);
            }
            else {
                v.value = {
                    start: offset,
                    end: offset
                }
            }
        }
    });
    axes.cancels.push(defaultOffset.$r);
    return defaultOffset;
}


export function maxWindow(chart: XYChart, axes: AxisCollection, primary: variable.IVariable<IXYAxis>, axesSettings: IChartAxisSettings, offsetSettings: variable.IVariable<IDomainOffsetSettings>){
    var innerProc: procedure.IProcedure;
    var maxWindow = variable<IPointInterval>(null).listener(v => {        
        if (axesSettings.maxWindow && typeof axesSettings.maxWindow === "object"){
            if ("start" in axesSettings.maxWindow){
                res = <IPointInterval>axesSettings.maxWindow;
            }
            else {
                var dom = (<IMaximizedDomainSettings>axesSettings.maxWindow).domain;
                var res = dom;
            }
        }
        if (!res){
            res = axes.primary.domain;
        }
        if (innerProc){
            innerProc.cancel();
        }
        var os = offsetSettings.value;
        var startAdd = calculateOffset(os.start, res, createSizeGetterByYCoordinateOrigin(axes.origin, chart.center), false, primary.value.type === "log");
        var endAdd = calculateOffset(os.end, res, createSizeGetterByYCoordinateOrigin(axes.origin, chart.center), true, primary.value.type === "log");
        var mwind = new ReactivePointInterval();
        innerProc = procedure(() => {
            mwind.start = res.start - startAdd();
            mwind.end = res.end + endAdd();
        });
        v.value = mwind;
    });
    (<AxisCollection>axes).cancels.push({
        cancel: () => {
            maxWindow.$r.cancel();
            if (innerProc){
                innerProc.cancel();
            }
        }
    });
    return maxWindow;
}