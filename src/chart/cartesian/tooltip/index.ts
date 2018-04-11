/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {nullCancellable, procedure, variable} from "@reactivelib/reactive";
import {XYChart} from "../index";
import {ISeriesFocusData, IXYFocus, XYFocus} from "../focus/index";
import {create, init, inject} from "../../../config/di";
import {createDefaultRenderer} from "./render";
import {ITooltipTableContentSettings} from "../../render/canvas/shape/tooltip/content";
import {TooltipManager} from "../../render/html/tooltip/manager";
import {IGlobalChartSettings} from "../../style";
import {ChartTooltipManager} from "../../core/tooltip";
import {ICancellable} from "@reactivelib/reactive/src/cancellable";

export interface IXYTooltip{

}

export interface IXYTooltipModel extends IXYTooltip{

}

export interface IXSortedChartTooltip extends IXYTooltip{

}

export class XYChartTooltip implements IXSortedChartTooltip, IXYTooltipModel{

    public r_tooltipManager = variable<TooltipManager>(null);
    get tooltipManager(){
        return this.r_tooltipManager.value;
    }
    set tooltipManager(v){
        this.r_tooltipManager.value = v;
    }

}

/**
 * Settings on how to render the tooltip
 * @settings
 */
export interface IXYTooltipSettings extends IChartTooltipContentSettings{
    show?: boolean;
    /**
     * Filters out all duplicate data-rows. A data-row is determined equal if it uses the same label.
     */
    filterDuplicates?: boolean;
    
    content?: ITooltipTableContentSettings;
    margin?: number;
    delay?: number;
    share?: IXYTooltip;
    
}

var defaults = {
    shared: true
}

/**
 * @settings
 */
export interface IChartTooltipContentSettings{

    shared?: boolean;
    render?: (focus: IXYFocus) => any;
    renderRow?: (data: ISeriesFocusData) => any;
    transformData?: (focus: ISeriesFocusData[]) => ISeriesFocusData[];
    delay?: number;

}

export class XYTooltip{

    @inject
    chart: XYChart

    @inject
    theme: IGlobalChartSettings

    @create(function(this: XYTooltip){
        return createDefaultRenderer(this.chart, this.chart.settings, this.tooltipSettings, this.theme);
    })
    defaultRenderer: (focus: IXYFocus) => any

    @create(function(this: XYTooltip){
        var res = variable<IXYTooltipSettings>(null).listener(v => {
            v.value = this.chart.settings.tooltip || {shared: true, show: true};
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    tooltipSettings: variable.IVariable<IXYTooltipSettings>

    @create(function(this: XYTooltip){
        var res = variable<(focus: IXYFocus) => any>(null).listener(v => {
            var set = this.tooltipSettings.value;
            if (set.render){
                v.value = set.render;
            }
            else {
                v.value = this.defaultRenderer;
            }
        });
        this.chart.cancels.push(res.$r);
        return function(focus: IXYFocus){
            return res.value(focus);
        };
    })
    provideContent: (focus: IXYFocus) => any

    @create(() => new XYChartTooltip())
    tooltip: XYChartTooltip

    @inject
    focus: XYFocus

    @create(function(this: XYTooltip){
        var last: ICancellable = nullCancellable;
        var manager = variable<TooltipManager>(null).listener(v => {
            var manager: ChartTooltipManager;
            var ttsets = this.tooltipSettings.value;
            last.cancel();
            if (ttsets.share){
                manager = <ChartTooltipManager>(<XYChartTooltip>ttsets.share).tooltipManager;
            }
            else{
                manager = new ChartTooltipManager(this.chart.center, this.tooltipSettings, this.theme);
                var c = this.chart.center.getLayer(null).child;
                c.push(manager);
                last = {
                    cancel: () => {
                        c.remove(c.indexOf(manager));
                    }
                }
            }
            v.value = manager;
        });
        this.tooltip.r_tooltipManager = manager;
        this.chart.cancels.push({
            cancel: () => {
                manager.$r.cancel();
                last.cancel();
            }
        });
        return manager;
    })
    manager: variable.IVariable<ChartTooltipManager>

    @create(function(this: XYTooltip){
        var last: ICancellable;
        var proc = procedure(() => {
            if (last){
                last.cancel();
            }
            var focus = this.focus;
            var theme = this.theme;
            var set = this.tooltipSettings.value;
            var show = !("show" in set) || set.show;
            if (show && focus.nearestData != null){
                var sbb = focus.screenDataBoundingBox;
                sbb = {
                    x: sbb.x,
                    y: sbb.y,
                    width: sbb.width,
                    height: sbb.height
                }
                var content = this.provideContent(focus);
                var margin = this.tooltipSettings.value.margin || (theme.tooltip && theme.tooltip.margin) || 0;
                var padding = {bottom: margin, top: margin, left: margin, right: margin};
                var add = this.manager.value.add({
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
        this.chart.cancels.push({
            cancel: () => {
                proc.cancel();
                last && last.cancel();
            }
        })
        return proc
    })
    manage

    @init
    init(){
        this.manage
    }

}