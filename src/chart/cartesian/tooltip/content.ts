/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import { IChartTooltipContentSettings } from "./index";
import { variable } from "@reactivelib/reactive";
import { IXYFocus } from "../focus";
import { XYChart } from "..";
import {deps} from "../../../config/di";

export default deps(function(chart: XYChart, tooltipSettings: variable.IVariable<IChartTooltipContentSettings>, defaultRenderer: (focus: IXYFocus) => any){
    var res = variable<(focus: IXYFocus) => any>(null).listener(v => {
        var set = tooltipSettings.value;
        if (set.render){
            v.value = set.render;
        }
        else {
            v.value = defaultRenderer;
        }    
    });
    chart.cancels.push(res.$r);
    return function(focus: IXYFocus){
        return res.value(focus);
    };
}, ["chart", "tooltipSettings", "defaultRenderer"])