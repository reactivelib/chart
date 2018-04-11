/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICancellable, procedure, variable} from "@reactivelib/reactive";
import {IXYTooltipSettings} from "./index";
import {XYFocus} from "../focus";
import {IGlobalChartSettings} from "../../style";
import {ChartTooltipManager} from "../../core/tooltip";
import {CoreChart} from "../../core/basic";
import {deps} from "../../../config/di";

export default deps(function(tooltipSettings: variable.IVariable<IXYTooltipSettings>,
    focus: XYFocus, manager: variable.IVariable<ChartTooltipManager>, provideContent: (focus: XYFocus) => any,
    chart :CoreChart, theme: IGlobalChartSettings){
    var last: ICancellable;
    var proc = procedure(() => {
        if (last){
            last.cancel();
        }
        var set = tooltipSettings.value;
        var show = !("show" in set) || set.show;
        if (show && focus.nearestData != null){
            var sbb = focus.screenDataBoundingBox;
            sbb = {
                x: sbb.x,
                y: sbb.y,
                width: sbb.width,
                height: sbb.height
            }
            var content = provideContent(focus);
            var margin = tooltipSettings.value.margin || (theme.tooltip && theme.tooltip.margin) || 0;
            var padding = {bottom: margin, top: margin, left: margin, right: margin};
            var add = manager.value.add({
                target: sbb,
                get content(){
                    return content;
                },
                padding: padding
            });            
            last = {
                cancel: () => {
                    add.cancel();
                }
            }
        }
    });
    chart.cancels.push({
        cancel: () => {
            proc.cancel();
            last && last.cancel();
        }
    })
}, ["tooltipSettings", "focus", "manager", "provideContent", "chart", "theme"])