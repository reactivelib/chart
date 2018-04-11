/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPieChartSettings} from "../factory";
import {IValueData, IValuePoint} from "../../../datatypes/value";
import {IPieSeries} from "../series";
import {ILabelStyle} from "../../render/canvas/label/cache/index";
import {variable} from "@reactivelib/reactive";
import {IPieDataLabelRenderer} from "./index";
import {PieChart} from "..";
import {SVGComponent, svgComponentLabel} from "../../render/html/svg/component";
import {HtmlLayer, SVGContainer} from "../../core/center/index";
import {html, svg} from "@reactivelib/html";
import {measureShapeDimensions} from "../../render/html/measure";
import {HTMLComponent} from "../../render/html/component";
import {IDimension, IRectangle} from "../../../geometry/rectangle";
import {deps} from "../../../config/di";

export interface ILabelAndCancel{
    label: IRectangle;
    cancel();
}

export interface ILabelRenderer{
    getDimension(): IDimension;
    attachLabel(): ILabelAndCancel;
}

class HtmlLabelAndDimensionProvider implements ILabelRenderer{

    constructor(public html: HTMLComponent, public parent: HtmlLayer){

    }

    public getDimension(){
        return measureShapeDimensions(() => <html.IHtmlShape>html(this.html), this.parent.node.element);
    }

    public attachLabel(){
        var label = this.html;
        this.parent.child.push(label);
        return {
            label: label,
            cancel: () => {
                this.parent.child.remove(this.parent.child.indexOf(label));
            }
        }
    }

}

class SvgLabelAndDimensionProvider implements ILabelRenderer{

    constructor(public html: SVGComponent, public parent: SVGContainer){

    }

    public getDimension(){
        var svgShape = <svg.ISvgShape>svg(this.html);
        var ctx = html.context(this.parent.node.element);
        ctx.index = this.parent.node.element.childNodes.length;
        svgShape.render(ctx);
        ctx.pop();
        ctx.stop();
        var res = {
            width: this.html.width,
            height: this.html.height
        }
        return res;
    }

    public attachLabel(){
        var label = this.html;
        this.parent.child.push(label);
        return {
            label: label,
            cancel: () => {
                this.parent.child.remove(this.parent.child.indexOf(label));
            }
        }
    }
}

export default function(settings: IPieChartSettings, chart: PieChart){
    function createSvg(label: string){
        return new SvgLabelAndDimensionProvider(svgComponentLabel(labelStyle.value, label), chart.center.getLayer(10).getSvg());
    }
    var labelStyle = variable<ILabelStyle>(null).listener(v => {
        if (settings.label && settings.label.style){
            v.value = settings.label.style;
        }        
        else{
            v.value = {
                fill: "rgb(255, 255, 255)"
            }
        }
    });
    var labelRend = variable<(data: IValuePoint, series: IPieSeries) => ILabelRenderer>(null).listener(v => {
        rend = "auto";
        if (settings.label){
            if (settings.label.render){
                var rend = settings.label.render;                
            }
        }
        if (typeof rend === "function"){
            v.value = function(data: IValueData, series: IPieSeries){                    
                var r = (<IPieDataLabelRenderer>rend)(data, series);
                if (typeof r === "string"){
                    return createSvg(r);
                }
                else{
                    return new HtmlLabelAndDimensionProvider(new HTMLComponent(variable.transformProperties({
                        html: r,
                        x: 0,
                        y: 0
                    })), chart.center.getLayer(10));
                }
            }
        }
        else{
            switch(rend){
                case "auto":
                v.value = function(data, series){
                    if (data.l){
                        return createSvg(data.l);
                    }
                    return createSvg(data.y+"");
                }
                break;
                case "label":
                v.value = function(data, series){
                    if (data.l){
                        return createSvg(data.l);
                    }
                    return null;
                }
                break;
                case "value":
                v.value = function(data, series){
                    return createSvg(data.y+"");
                }
                break;
            }
        }
    });
    chart.cancels.push(labelStyle.$r);
    chart.cancels.push(labelRend.$r);
    return function(data: IValuePoint, series: IPieSeries): ILabelRenderer{
        return labelRend.value(data, series);
    }
}