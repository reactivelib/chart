/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IXYSeriesSystem} from "./series";
import {XYChartViewportGroup} from "../area/collection/index";
import {IXYAxis} from "../axis/index";
import {ICancellable, variable} from "@reactivelib/reactive";
import {XYAreaSystem} from "../area/index";

export default function area(series: IXYSeriesSystem, viewports: XYChartViewportGroup, xAxis: variable.IVariable<IXYAxis>, yAxis: variable.IVariable<IXYAxis>){
    var lastXAxis: IXYAxis;
    var lastYAxis: IXYAxis;
    var lastViewport: ICancellable;
    var area = variable<XYAreaSystem>(null).listener(v => {
        var eqx = lastXAxis === xAxis.value;
        var eqy = lastYAxis === yAxis.value;
        if (lastXAxis){
            viewports.remove(lastXAxis, lastYAxis);
        }
        lastXAxis = xAxis.value;
        lastYAxis = yAxis.value;
        var vp;
        vp = <XYAreaSystem>viewports.add(lastXAxis, lastYAxis);
        v.value = vp;
        if (!eqx || !eqy){
            lastViewport = v.value.addSeries(series);
        }        
    });
    series.cancels.push({
        cancel: () => {
            area.$r.cancel();    
            viewports.remove(lastXAxis, lastYAxis);            
            lastViewport.cancel();
        }
    });
    return area;
}