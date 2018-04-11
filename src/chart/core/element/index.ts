/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CoreChart, IChartSettings, IDimensionSettings} from "../basic";
import {procedure, transaction, variable} from "@reactivelib/reactive";
import {parseBoxModel} from "../../render/html/measure/box";
import {IDimension} from "../../../geometry/rectangle";

function getDefaultVal(val: "auto" | number){
    if (typeof val === "string"){
        return 500;
    }
    return val;
}

export function onAttached(parent: HTMLElement, chart: CoreChart, settings: IChartSettings,
     width: variable.IVariable<IDimensionSettings>, height: variable.IVariable<IDimensionSettings>){
    var resize: any;
    var resizeProc: procedure.IAnimationFrameExecution;
    var eventList: any;
    var cancelled = false;
    procedure(p => {
        var vw = width.value;
        var hv = height.value;
        if (!cancelled){
            var temp = chart.temporaryDimensions || <IDimension><any>{};
            if (parent){
                if (!resizeProc){                    
                    if (vw.value === "auto" || hv.value === "auto") {
                        chart.style.position = "relative";
                        (<HTMLElement>chart.node.element).style.position = "relative";
                        var wmin = "min" in vw ? vw.min : -Number.MAX_VALUE;                        
                        var wmax = "max" in vw ? vw.max : Number.MAX_VALUE;
                        var hmin = "min" in hv ? hv.min : -Number.MAX_VALUE;
                        var hmax = "max" in hv ? hv.max : Number.MAX_VALUE;
                        var w = vw.value === "auto";
                        var h = hv.value === "auto";
                        resize = function () {
                            var vw = width.value;
                            var hv = height.value;
                            var temp = chart.temporaryDimensions || {};
                            w = vw.value === "auto" && !("width" in temp);
                            h = hv.value === "auto" && !("height" in temp);
                            if ((<any>chart).blockedResize) {
                                return;
                            }
                            var s = window.getComputedStyle(parent);
                            var bm = parseBoxModel(parent, s);
                            if (w) {                                
                                chart.width = Math.max(wmin, Math.min(wmax, bm.contentWidth));
                            }
                            if (h) {                            
                                chart.height = Math.max(hmin, Math.min(hmax, bm.contentHeight));
                            }
                        }
                        transaction(() => {
                            resizeProc = procedure.animationFrame(() => {
                                resize();
                            });
                            resize();
                            if (!w){
                                chart.width = temp.width || <number>vw.value;
                            }
                            if (!h){
                                chart.height = temp.height || <number>hv.value;
                            }
                            eventList = () => {
                                resizeProc.markChanged();
                            };
                            window.addEventListener("resize", eventList);
                        });                        
                    }
                    else {
                        chart.width = vw.value;
                        chart.height = hv.value;
                    }
                }
                else {
                    var w = vw.value === "auto" && !("width" in temp);
                    var h = hv.value === "auto" && !("height" in temp);
                    if (!w){
                        chart.width = temp.width || <number>vw.value;
                    }
                    if (!h){
                        chart.height = temp.height || <number>hv.value;
                    }
                }

            }
            else {
                chart.width = temp.width || getDefaultVal(vw.value);
                chart.height = temp.height || getDefaultVal(hv.value);
            }
        }
    });
    chart.refresh = function(){
        if (resizeProc){
            resizeProc.markChanged();
        }
    }
    return {
        cancel: () => {
            if (resizeProc){
                resizeProc.cancel();
                window.removeEventListener("resize", eventList);
            }
            cancelled = true;
        }
    }
}

/*
export default function(chart: IChartSystem, settings: IChartSettings, width: IVariable<IDimensionSettings>, height: IVariable<IDimensionSettings>, theme: IGlobalChartSettings){
    var canv: CanvasRenderer = null;
    var resize: any;
    var proc: Procedure;
    var resizeProc: Procedure;

    procedure(p => {
        var vw = width.value;
        var hv = height.value;
        if (!chart.cancelled){
            var el: HTMLElement;
            if (settings.element) {
                if (typeof  settings.element === "string") {
                    el = document.getElementById(settings.element);
                }
                else {
                    el = settings.element;
                }
            }
            if (el){
                if (!canv){
                    canv = new CanvasRenderer();
                    initHTMLShape(canv, {
                        tag: "none",
                        style: theme.chart
                    });
                    canv.addChild(chart);
                    if (vw.value === "auto" || hv.value === "auto") {

                        var wmin = "min" in vw ? vw.min : -Number.MAX_VALUE;
                        var wmax = "max" in vw ? vw.max : Number.MAX_VALUE;
                        var hmin = "min" in hv ? hv.min : -Number.MAX_VALUE;
                        var hmax = "max" in hv ? hv.max : Number.MAX_VALUE;
                        var w = vw.value === "auto";
                        var h = hv.value === "auto";
                        resize = function () {
                            var vw = width.value;
                            var hv = height.value;
                            w = vw.value === "auto";
                            h = hv.value === "auto";
                            if ((<any>chart).blockedResize) {
                                return;
                            }
                            var s = window.getComputedStyle(el);
                            var bm = parseBoxModel(el, s);
                            if (w) {
                                chart.width = Math.max(wmin, Math.min(wmax, bm.contentWidth));
                            }
                            if (h) {
                                chart.height = Math.max(hmin, Math.min(hmax, bm.contentHeight));
                            }
                        }
                        var attached = false;
                        inTransaction(() => {
                            resizeProc = procedure(() => {
                                resize();
                            });
                            if (!w){
                                chart.width = <number>vw.value;
                            }
                            if (!h){
                                canv.height = <number>hv.value;
                            }
                            window.addEventListener("resize", () => {
                                resizeProc.markChanged();
                            });
                            if (!attached){
                                attached = true;
                                attach(el, canv);
                            }
                        });                        
                    }
                    else {
                        chart.width = vw.value;
                        chart.height = hv.value;
                        attach(el, canv);
                    }
                    proc = procedure(() => {
                        canv.width = chart.width;
                        canv.height = chart.height;
                    });
                }
                else {
                    var w = vw.value === "auto";
                    var h = hv.value === "auto";
                    if (!w){
                        chart.width = <number>vw.value;
                    }
                    if (!h){
                        chart.height = <number>hv.value;
                    }
                }

            }
            else {
                if (canv){
                    detach(canv);
                    proc && proc.$r.cancel();
                    resizeProc && resizeProc.$r.cancel();
                    window.removeEventListener("resize", resize);
                    canv = null;
                }
                chart.width = getDefaultVal(vw.value);
                chart.height = getDefaultVal(hv.value);
            }
        }
        else {
            if (canv){
                detach(canv);
                proc && proc.$r.cancel();
                resizeProc && resizeProc.$r.cancel();
                window.removeEventListener("resize", resize);
                canv = null;
            }
        }
    });

    return function(){
        if (resizeProc){
            resizeProc.markChanged();
        }
    }


}
*/