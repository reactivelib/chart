/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import { variable } from "@reactivelib/reactive";
import {IPieSeries, IPieSeriesSettings, PieSeries} from "../series";
import {create, inject, init} from "../../../config/di";
import {IFoundSlice} from "../series/render";
import {selectedNode} from "../../render/canvas/html/event";
import {findCanvasShape} from "../../render/canvas/html/util";
import {ChartCenter} from "../../core/center";
import {ICanvasConfig, renderCanvas} from "../../render/canvas/shape/create";
import {PieHighlighterShape} from "../series/highlight";
import {ICanvasChildShape} from "../../render/canvas/shape";
import {PieChart} from "../index";
import {procedure, unobserved} from "@reactivelib/reactive";

export interface IPieSeriesFocusData{
    index: number;
    settings: IPieSeriesSettings;
    series: IPieSeries;
}

export interface IPieChartFocus{
    nearestData: IPieSeriesFocusData;
}

export class PieChartFocus implements IPieChartFocus{
    @create(function(this: PieChartFocus){
        var res = variable<IPieSeriesFocusData>(null).listener(v => {
            var t = this.target.value;
            if (t){
                v.value = {
                    index: t.index,
                    settings: t.series.settings,
                    series: t.series
                }
            }
            else{
                v.value = null;
            }
        });
        return res;
    })
    public r_nearestData: variable.IVariable<IPieSeriesFocusData>;
    get nearestData(){
        return this.r_nearestData.value;
    }
    set nearestData(v){
        this.r_nearestData.value = v;
    }

    @inject
    center: ChartCenter

    @inject
    seriesCanvasGroup: ICanvasConfig

    @inject
    chart: PieChart

    @create(function(this: PieChartFocus){
        var target = variable<IFoundSlice>(null);
        this.center.events.add({
            move: (ev) => {
                var cr = this.center.calculateBoundingBox();
                var relPos = {
                    x: ev.clientX - cr.left,
                    y: ev.clientY - cr.top
                }
                var selected = selectedNode(findCanvasShape(this.seriesCanvasGroup.node).find(relPos));
                if (selected){
                    var t = <IFoundSlice>selected.shape;
                    if ("data" in t && t.series){
                        target.value = <IFoundSlice>t;
                    }
                    else{
                        target.value = null;
                    }
                }

            },
            leave: (ev) => {
                target.value = null;
            }
        });
        return target;
    })
    target: variable.IVariable<IFoundSlice>

    @init
    init(){
        var last: IPieSeriesFocusData;
        var lastChild: ICanvasChildShape;
        var childs = this.chart.center.getLayer(10).getCanvas().child;
        var proc = procedure(() => {
            var nd = this.nearestData;
            unobserved(() => {
                if (lastChild){
                    childs.remove(childs.indexOf(lastChild));
                    lastChild = null;
                }
                if (nd){
                    var shape = new PieHighlighterShape(<PieSeries>nd.series, nd.index);
                    lastChild = renderCanvas({
                        tag: "g",
                        child: [shape],
                        style: {
                            lineWidth: 4
                        }
                    });
                    childs.push(lastChild);
                }
            });
        });
        this.chart.cancels.push(proc);
    }

}