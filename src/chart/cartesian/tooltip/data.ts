/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import { IChartTooltipContentSettings } from "./index";
import { variable } from "@reactivelib/reactive";
import { IXYFocus, ISeriesFocusData } from "../focus";
import { XYChart } from "..";
import {deps} from "../../../config/di";

function nearestChartData(focus: IXYFocus){
    return [focus.nearestData]
}

function focusedChartData(focus: IXYFocus){
    return focus.focusedData;
}

function getChartDataProvider(shared: boolean){
    if (shared){
        return focusedChartData;
    }
    else {
        return nearestChartData;
    }
}

export default deps(function(chart: XYChart, tooltipSettings: variable.IVariable<IChartTooltipContentSettings>): (focus: IXYFocus) => ISeriesFocusData[]{
    var res = variable<(focus: IXYFocus) => ISeriesFocusData[]>(null).listener(v => {
        var set = tooltipSettings.value;
        var getData = getChartDataProvider(set.shared)
        var trD = set.transformData;
        if (trD){
            var data = getData;
            getData = function(focus: IXYFocus){
                return trD(data(focus))
            }
        }
        v.value = getData;
    });
    chart.cancels.push(res.$r);
    return function(focus: IXYFocus){
        return res.value(focus);
    }
}, ["chart", "tooltipSettings"])