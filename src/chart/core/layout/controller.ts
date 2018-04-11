/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array, getReactor, procedure, variable} from "@reactivelib/reactive";
import {html} from "@reactivelib/html";
import {HTMLAxisCenter} from "../../../component/layout/axis/center";
import {IInnerAndOuterElements} from "../../../component/layout/axis/positioning/relative/transform";
import {layoutGridElementsRecursive} from "../../../component/layout/axis/positioning/recursive";
import {CoreChart, IChartSettings} from "../basic";
import {IRectangle} from "../../../geometry/rectangle/index";

class SVGArea{

    public attr: any;
    public style: any;
    public node: html.IHtmlShape;
    public tag: "svg";

    constructor(public center: IRectangle){
        this.attr = {

            get width(){
                return center.width;
            },

            get height(){
                return center.height;
            }
        }
        this.style = {
            position: "absolute",
            left: "0px",
            top: "0px",
            pointerEvents: "none"
        }
    }

    public r_child = variable<html.IHtmlShapeTypes[]>([]);

    get child(){
        return this.r_child.value;
    }

    set child(v){
        this.r_child.value = v;
    }
}

SVGArea.prototype.tag = "svg";

export class LayoutShape implements html.IElementConfig{

    public tag = "custom";
    public childManager: html.IChildRenderer;
    public node: html.IHtmlNodeComponent;
    public svgArea:SVGArea;

    public children = array<html.IHtmlShapeTypes>();
    public layoutUpdater: procedure.IManualProcedureExecution;

    constructor(public center: HTMLAxisCenter,
                public innerAndOuter: variable.IVariable<IInnerAndOuterElements>,
                public chartSettings: IChartSettings,
                public chart: CoreChart,
                public afterResize: (() => void)[],
                public afterLayout: (() => boolean)[]){
        this.svgArea = new SVGArea(chart);
        var self = this;
        Object.defineProperty(this.svgArea, "child", {
            get: function(){
                var io = innerAndOuter.value;
                var svg = [];
                io.elements.forEach(e => {
                    var c = <html.IHtmlShapeTypes>e.component;
                    if (e.isSvg){
                        svg.push(c);
                    }
                });
                io.center.forEach(el =>{
                    var c = <html.IHtmlShapeTypes>el.component;
                    if (el.isSvg){
                        svg.push(c);
                    }
                });
                return svg;
            },
            configurable: true,
            enumerable: true
        })
    }

    public onAttached(){
        var self = this;
        this.childManager = html.childRenderer({
            get child(){
                var io = self.innerAndOuter.value;
                var res = (<html.IHtmlShapeTypes[]>[]);
                self.children.values.forEach(c => {
                    res.push(c);
                });
                res.push(self.center);
                res.push(self.svgArea);
                io.elements.forEach(e => {
                    var c = <html.IHtmlShapeTypes>e.component;
                    if (!e.isSvg) {
                        {
                            res.push(c);
                        }
                    }
                });
                io.center.forEach(el =>  {
                    var c = <html.IHtmlShapeTypes>el.component;
                    if (!el.isSvg){
                        res.push(c);
                    }
                });
                return res;
            },
            parent: this.node
        });
        this.layoutUpdater = procedure.manual((p) => {
            this.layoutComponents();
        });
    }

    onDetached(){
        this.childManager.children.forEach(c => c.onDetached());
    }

    public layoutComponents(){
        var io = this.innerAndOuter.value;
        var cs = this.chartSettings.center || {};
        if (cs.ignoreBorderDimensions){
            var border = {
                left:0, right: 0, bottom: 0, top: 0
            }
        }
        else
        {
            border = this.center.border;
        }
        var self = this;
        layoutGridElementsRecursive({
            center: this.center,
            afterResize: this.afterResize,
            afterLayout: this.afterLayout,
            border: border,
            container: {
                x:0,
                y: 0,
                get width(){
                    return self.chart.width;
                },
                get height(){
                    return self.chart.height;
                }
            },
            centerElements: io.center,
            elements: io.elements
        });
    }

    render(ctx: html.IIndexedHtmlRenderContext){
        this.center.phase = 1;
        this.childManager.update();
        var indx = ctx.index;
        this.childManager.children.forEach(c => {
            c.render(ctx);
        });
        ctx.index = indx;
        this.layoutUpdater.update();
        this.center.phase = 2;
        this.childManager.children.forEach(c => {
            c.render(ctx);
        });
    }
}