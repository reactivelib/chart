/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {default as unified, UnifiedEventBroadcaster} from "../../render/html/event/unified";
import {AxisCenterStyle, HTMLAxisCenter} from "../../../component/layout/axis/center";
import {IDimension} from "../../../geometry/rectangle/index";
import {array} from "@reactivelib/reactive";
import {ICanvasShapeOrConfig, default as renderCanvas} from "../../render/canvas/shape/create";
import {html} from "@reactivelib/html";
import {node} from "@reactivelib/reactive";
import {CoreChart, IChartSettings} from "../basic";
import {createCanvasShape} from "../../render/canvas/html/index";
import {init, inject} from "../../../config/di";
import {IGlobalChartSettings} from "../../style";
import {borderStyleToCSS} from "../../render/style/border";

export class CanvasContainer{

    public tag: "canvas" = "canvas";

    constructor(public parent: IDimension){

    }

    get width(){
        return this.parent.width;
    }

    get height(){
        return this.parent.height;
    }

    public child = array<ICanvasShapeOrConfig>();
}

class SVGDiv{

    public svg: SVGContainer;
    public tag = "div";
    public style: any;
    public child: any;
    public node: html.IHtmlShape;

    constructor(parent: IDimension){
        this.style = {
            position: "absolute",
            width: "100%",
            height: "100%",
            left: "0",
            top: "0"
        }
        this.svg = new SVGContainer(parent);
        this.child = this.svg;
    }
}

export class SVGContainer{

    public tag = "svg";
    public style: any;
    public attr: any;
    public node: html.IHtmlShape;

    constructor(public parent: IDimension){
        this.attr = {
            get width(){
                return parent.width;
            },
            get height(){
                return parent.height;
            }
        }
    }

    public child = array<html.IHtmlShapeTypes>();

}

export class HtmlLayer{

    public tag = "div";
    public style: any;
    public child = array<html.IHtmlShapeTypes>();
    public node: html.IHtmlShape;

    constructor(public parent: IDimension, zIndex: number){
        this.style = {
            border: "none",
            padding: "0",
            margin: "0",
            position: "absolute",
            get width(){
                return parent.width+"px";
            },
            get height(){
                return parent.height+"px";
            }
        }
    }

    private svg: SVGDiv;
    private canvas: CanvasContainer;

    public getSvg(){
        if (!this.svg){
            this.svg = new SVGDiv(this.parent);
            this.child.push(this.svg);
        }
        return this.svg.svg;
    }

    public getCanvas(){
        if (!this.canvas){
            this.canvas = new CanvasContainer(this.parent);
            this.child.push(createCanvasShape(this.canvas));
        }
        return this.canvas;
    }

}


export class ChartCenter extends HTMLAxisCenter{

    public events = new UnifiedEventBroadcaster();
    public event = unified(this.events);

    public nrToLayer: {[s: string]: HtmlLayer} = {};

    private $r = node();
    constructor(){
        super();
    }

    @inject
    chart: CoreChart

    @inject
    theme: IGlobalChartSettings

    initCenterStyle(){

    }

    get style(){
        var borderSettings = (this.chart.settings.center && this.chart.settings.center.border) || (this.theme.center && this.theme.center.border) || {};
        var res: any = new AxisCenterStyle(this);
        if (borderSettings){
            if (typeof borderSettings === "string"){
                res.border = borderSettings;
            }
            else{
                var style = borderStyleToCSS(borderSettings);
                for (var k in style){
                    res[k] = style[k];
                }
            }
        }
        return res;
    }

    @init
    init(){
        var self = this;
        this.width = 500;
        this.height = 500;
    }

    public calculateBoundingBox(){
        return (<HTMLElement>this.node.element).getBoundingClientRect();
    }

    public getLayer(nr: number){
        var layer = this.nrToLayer[nr];
        if (!layer){
            layer = new HtmlLayer(this, nr);
            this.nrToLayer[nr] = layer;
            this.$r.changedDirty();
        }
        return layer;
    }

    get child(){
        this.$r.observed();
        var res = [];
        for (var nr in this.nrToLayer){
            res.push(this.nrToLayer[nr]);
        }
        return res;
    }

}