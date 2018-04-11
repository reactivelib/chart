/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPieChartFocus, PieChartFocus} from "../focus";
import {ITooltipTableContentSettings} from "../../render/canvas/shape/tooltip/content";
import {create, init, inject} from "../../../config/di";
import render from './render';
import {PieChart} from "../index";
import {IGlobalChartSettings} from "../../style";
import {TooltipManager} from "../../render/html/tooltip/manager";
import {ChartTooltipManager} from "../../core/tooltip";
import {ICancellable} from "@reactivelib/reactive/src/cancellable";
import {nullCancellable, procedure, variable} from "@reactivelib/reactive";
import {PieSeries} from "../series";
import {polarToCartesian} from "../../../math/transform/polar";
import {HTMLComponent} from "../../render/html/component";
import {PaddedRectange} from "../../../geometry/rectangle";

export interface IPieTooltipSettings{
    render?: (focus: IPieChartFocus) => any;
    delay?: number;
    content?: ITooltipTableContentSettings;
    show?: boolean;
    margin?: number;
}

export class PieTooltip{

    @inject
    chart: PieChart

    @inject
    theme: IGlobalChartSettings

    @create(function(this: PieTooltip){
        return render(this.chart, this.chart.settings, this.theme);
    })
    render: (f: IPieChartFocus) => any;

    @create(function(this: PieTooltip){
        var manager = variable<TooltipManager>(null).listener(v => {
            var manager: ChartTooltipManager;
            var self = this;
            manager = new ChartTooltipManager(this.chart, {
                get value(){
                    return self.chart.settings.tooltip || {}
                }
            }, this.theme);
            v.value = manager;
            this.chart.shapes.push(manager);
        });
        this.chart.cancels.push({
            cancel: () => {
                manager.$r.cancel();
                this.chart.shapes.remove(this.chart.shapes.indexOf(manager));
            }
        });
        return manager;
    })
    manager: variable.IVariable<ChartTooltipManager>

    @inject
    focus: PieChartFocus

    @init
    init(){
        var last: ICancellable;
        var proc = procedure(() => {
            if (last){
                last.cancel();
            }
            var focus = this.focus;
            var chart = this.chart;
            var set = this.chart.settings.tooltip || {};
            var show = !("show" in set) || set.show;
            if (show && focus.nearestData != null){
                var ps = (<PieSeries>focus.nearestData.series).renderedShapes[focus.nearestData.index];
                if (!ps){
                    return;
                }
                //var tr = getTransform(chart.center);
                var xy = polarToCartesian((ps.startAngle + ps.endAngle) / 2, (ps.startRadius + ps.endRadius) / 2);
                //  xy = tr.transform(xy.x + chart.centerX, xy.y + chart.centerY);
                var sbb = {
                    x: xy.x +chart.centerX,
                    y: xy.y +chart.centerY,
                    width: 0,
                    height: 0
                }
                var content = this.render(focus);
                var add = this.manager.value.add({
                    target: sbb,
                    get content(){
                        return content;
                    },
                    padding: null
                });
                last = {
                    cancel: () => {
                        add.cancel();
                    }
                }
            }
        });
        this.chart.cancels.push({
            cancel: () => {
                proc.cancel();
                last && last.cancel();
            }
        })
    }

}