/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterable, IIterator, iterator, mapIterator} from "../../../collection/iterator/index";
import {IFitnessAndRectangles} from "../../../geometry/layout/rectangle/incremental/fitness";
import {array, ICancellable, procedure, variable} from "@reactivelib/reactive";
import {
    getRectangleOppositeSideIntervalProvider,
    getRectangleSide
} from "../../../geometry/layout/rectangle/incremental/side";
import {IFlexibleTickAxis} from "../../../math/domain/axis/axis";
import {IDimension, IPadding, IRectangle, normalizePaddingSettings} from "../../../geometry/rectangle/index";
import {createPositioned4SideRectangleLayouter} from "../../../geometry/layout/rectangle/incremental/position/index";
import {getYCoordinatePointPositionProvider} from "../../../geometry/layout/rectangle/position/map";
import {IPositionedRectangle} from "../../../geometry/layout/rectangle/position/index";
import {IInterval} from "../../../geometry/interval/index";
import {IPoint} from "../../../geometry/point/index";
import {removeNegativeStart} from "../../../geometry/interval/normalize";
import {arrayIterator} from "../../../collection/iterator/array";
import {lru} from "../../../collection/cache/lru/index";
import {IPositionedLabel, IRectangleLabel} from "../../render/canvas/label/position/index";
import {ILabelStyle, LabelType} from "../../render/canvas/label/cache/index";
import {labelToPadded, PaddedPositionedLabel} from "../../render/canvas/label/position/padding";
import {IValueTransformer} from "../../../math/transform/interval";
import {ICartesianChartAxisLabelSettings} from "./component";
import {ICategory, IDiscreteXYAxis, IXYAxis, IXYAxisSystem} from "../axis";
import {html, svg} from "@reactivelib/html";
import {
    ComponentPosition,
    IGridPosition,
    IRelativePositionedGridElement
} from "../../../component/layout/axis/positioning/relative";
import {HTMLComponent} from "../../render/html/component";
import {svgComponentLabel} from "../../render/html/svg/component";
import decimalFormat from "../../../format/decimal";
import {DateLabelsPositionedLabelIterator} from "../categorical/label/time";
import {ICartesianChart, XYChart} from "../index";
import add from "./add";
import {IGlobalChartSettings} from "../../style";
import {TimeFlexibleMarkers} from "../../../math/domain/axis/time";
import {IAxisCollection} from "../axis/collection";
import {createGridLabelGenerator, createTimeGridLabelGenerator} from "../../render/canvas/label/position/axis";
import {ICalendar} from "../../../math/time/calendar";
import {createCategoricalLabelsIterable} from "../categorical/label/categorical";
import {create, define, init, inject} from "../../../config/di";
import {extend} from "@reactivelib/core";
import {findInIterator} from "../../../collection/iterator";
import {ICartesianViewport} from "../area";

export interface IChartAxisLabels extends IRectangle{
    generate(): IFitnessAndRectangles;
    consume(labels: IRectangleLabel[]): void;
    width: number;
    height: number;
    side: ComponentPosition | IGridPosition;
    axis: IFlexibleTickAxis;
    getExampleLabel(): IDimension;
}

class RectanglePreview implements IPositionedRectangle{
    
    public x: number;
    public y: number;
    public position: number;
    
    constructor(public dimensions: IDimension, public posLabel: IPositionedLabel, public shape?: ILabelResult){
        
    }
    
    get width(){
        return this.dimensions.width;
    }
    
    get height(){
        return this.dimensions.height;
    }
    
}

interface ICachedLabel extends IDimension{
    label: LabelType;
}

interface ILabelResult{
    label: html.IHtmlConfig & IRectangle;
    cancel: () => void;
    labelText: LabelType;
}

class SVGRectangle implements html.IHtmlConfig{

    public attr: any;
    public tag: "svg";
    public child = array<html.IHtmlShapeTypes>();
    public node: html.IHtmlShape;

    constructor(public labels: ChartAxisLabels){
        this.attr = {
            get width(){
                return labels.width+"px";
            },
            get height(){
                return labels.height+"px";
            }
        }
    }
}

SVGRectangle.prototype.tag = "svg";

class HTMLRect implements html.IHtmlConfig{
    public tag: "div";
    public attr:any = {
        class: "reactivechart-axis-labels"
    }
    public style: any;
    public child = array<html.IHtmlShapeTypes>();
    public node: html.IHtmlShape;

    constructor(public labels: ChartAxisLabels){
        this.style = {
            position: "absolute",
            padding: "0",
            border: "none",
            margin: "0",
            get left(){
                return labels.x+"px";
            },
            get top(){
                return labels.y+"px";
            }
        }
    }
}

HTMLRect.prototype.tag = "div";

function getDefaultFormat(ax: IXYAxis){
    if (ax.type === "discrete"){
        if ((<IDiscreteXYAxis>ax).time.active){
            return "dd-MM-yyyy hh:mm:ss";
        }
        return ",###.##";
    }
    if (ax.ticks instanceof TimeFlexibleMarkers){
        return "dd-MM-yyyy hh:mm:ss";
    }
    return ",###.##";
}


export class ChartAxisLabels implements IChartAxisLabels, html.IElementConfig{

    public layout: (it: IIterator<IPositionedRectangle>) => IFitnessAndRectangles;
    public ivl: (r: IRectangle) => IInterval;
    public ptProvider: (pt: IPoint) => number;
    public mapValue: (v: number) => number;
    public cache = lru<ICachedLabel>();

    @create(function(this: ChartAxisLabels){
        var vari = variable<ICartesianViewport>(null).listener(v => {
            var av = this.axis;
            var viewports = this.axisChart.value.viewports;
            var area = findInIterator(viewports.collection.iterator(), a => a.xAxis === av || a.yAxis === av);
            v.value = area;
        });
        this.cancels.push(vari.$r);
        return  () => {
            var area = vari.value;
            if (area.xAxis === this.axis){
                return area.xMapper;
            }
            else{
                return area.yMapper;
            }
        };
    })
    public mapperMatrix: () => IValueTransformer;
    public cancels: ICancellable[] = [];

    public r_x = variable(0);
    public r_y = variable(0);
    public r_width = variable(0);
    public r_height = variable(0);
    public shapes: html.IHtmlNodeComponent[] = [];

    public element: HTMLElement;
    public conte: html.IIndexedHtmlRenderContext;

    public tag = "custom";

    @define
    settings: ICartesianChartAxisLabelSettings

    @define
    gridSettings: IRelativePositionedGridElement

    @inject
    chart: XYChart

    @inject
    calendarFactory: (n: number) => ICalendar

    @create(function(this: ChartAxisLabels){
        var vari = variable<(ctx: ICategory) => LabelType>(null).listener(v => {
            var settings = this.settings;
            if (settings.renderer){
                v.value = settings.renderer.bind({
                    chart: this.axisChart.value
                });
                return;
            }
            v.value = function(pos: ICategory){
                return (pos.label || pos.id)+"";
            }.bind({chart: this.axisChart.value})
        });
        var res = function(ctx: ICategory){
            return vari.value(ctx);
        }
        this.cancels.push(vari.$r);
        return res;
    })
    renderLabelCategory: (ctx: ICategory) => LabelType

    @create(function(this: ChartAxisLabels){
        var vari = variable<IIterable<IPositionedLabel>>(null).listener((v) => {
            var ax = this.axis;
            if (ax.type === "discrete"){
                if ((<IDiscreteXYAxis>ax).time.active){
                    v.value = {
                        iterator: () => new DateLabelsPositionedLabelIterator(ax.window, ax.time, ax.ticks, (<IDiscreteXYAxis> ax).categories, this.calendarFactory)
                    };

                    return;
                }
                (<IDiscreteXYAxis>ax).categories;
                v.value = createCategoricalLabelsIterable(<variable.IVariable<IDiscreteXYAxis>>this.r_axis, this.renderLabelCategory);
                return;
            }
            if (ax.ticks instanceof TimeFlexibleMarkers){
                v.value = createTimeGridLabelGenerator({
                    axis: ax,
                    calendarFactory: this.calendarFactory,
                    timeUnit: () => (<IXYAxisSystem> ax).time.unit
                });
                return;
            }
            v.value = createGridLabelGenerator({
                axis: this.axis,
                format: this.format.value
            });
        })
        var res = {
            iterator: () => vari.value.iterator()
        }
        return res;
    })
    labelGenerator: IIterable<IPositionedLabel>;

    @create(function(this: ChartAxisLabels){
        var vari = variable<IXYAxis>(null).listener(v => {
            var axes: IAxisCollection;
            var axisChart = this.axisChart;
            var yAxes = axisChart.value.yAxes;
            var xAxes = axisChart.value.xAxes;
            switch (getRectangleSide(this.gridSettings.position)){
                case "bottom":
                case "top":
                case "inner-bottom":
                case "inner-top":
                    switch (yAxes.origin){
                        case "top":
                        case "bottom":
                            axes = xAxes;
                            break;
                        default:
                            axes = yAxes;
                            break;
                    }
                    break;
                default:
                    switch (yAxes.origin){
                        case "top":
                        case "bottom":
                            axes = yAxes;
                            break;
                        default:
                            axes = xAxes;
                            break;
                    }
            }
            if (this.settings.axis){
                v.value = axes.get(this.settings.axis);
            }
            else{
                v.value = axes.primary;
            }
        });
        this.cancels.push(vari.$r);
        return vari;
    })
    public r_axis: variable.IVariable<IXYAxis>;

    get axis(){
        return this.r_axis.value;
    }

    set axis(v){
        this.r_axis.value = v;
    }

    @create(function(this: ChartAxisLabels){
        var res = variable<XYChart>(null).listener(v => {
            v.value = <XYChart>this.settings.chart || this.chart;
        });
        return res;
    })
    axisChart: variable.IVariable<XYChart>

    @create(function(this: ChartAxisLabels){
        var res = variable<any>(null).listener(v => {
            var ax = this.axis;
            if (ax.type === "log"){
                var format = decimalFormat(",###.##");
                v.value = (n: number) => {
                    var nr = 0;
                    var seqs = (this.axis.tickDomain.start+"").split(".");
                    if (seqs.length > 1){
                        nr = Math.max(0, seqs[1].length);
                    }
                    format.fraction.minNr = 0;
                    format.fraction.maxNr = nr;
                    return format.format(n);
                }
                return;
            }
            v.value = this.settings.format || getDefaultFormat(ax);
        });
        this.cancels.push(res.$r);
        return res;
    })
    format: variable.IVariable<any>

    @inject
    theme: IGlobalChartSettings

    @create(function(this: ChartAxisLabels){
        var theme = this.theme
        var vari = variable<ILabelStyle>(null).listener(v => {
            var tem;
            if (this.axisCoordinate.value === "x" && theme.xAxis && theme.xAxis.label){
                tem = theme.xAxis.label;
            }
            if (this.axisCoordinate.value === "y" && theme.yAxis && theme.yAxis.label){
                tem = theme.yAxis.label;
            }
            v.value = extend({
                fill: "rgb(0, 0, 0)",
                font: "14px Arial"
            }, theme.font, tem, this.settings.style);
        });
        this.cancels.push(vari.$r);
        return vari;
    })
    style: variable.IVariable<ILabelStyle>

    @create(function(this: ChartAxisLabels){
        var vari = variable<string>(null).listener(v => {
            var axes: IAxisCollection;
            var yAxes = this.axisChart.value.yAxes;
            switch (getRectangleSide(this.gridSettings.position)){
                case "bottom":
                case "top":
                case "inner-bottom":
                case "inner-top":
                    switch (yAxes.origin){
                        case "top":
                        case "bottom":
                            v.value = "x";
                            break;
                        default:
                            v.value = "y";
                    }
                    break;
                default:
                    switch (yAxes.origin){
                        case "top":
                        case "bottom":
                            v.value = "y";
                            break;
                        default:
                            v.value = "x";
                    }
            }
        });
        return vari;
    })
    axisCoordinate: variable.IVariable<string>

    @create(function(this: ChartAxisLabels){
        var vari = variable<IPadding>(null).listener(v => {
            if ("space" in this.settings){
                v.value = normalizePaddingSettings(this.settings.space);
            }
            switch (getRectangleSide(this.side)){
                case "bottom":
                case "top":
                case "inner-top":
                case "inner-bottom":
                    v.value = {left: 0, top: 0, right: 2, bottom: 0};
                case "left":
                case "inner-left":
                    v.value = {left: 0, top: 0, right: 2, bottom: 0};
                case "right":
                case "inner-right":
                    v.value = {left: 2, top: 0, right: 0, bottom: 0};
            }
        });
        this.cancels.push(vari.$r);
        return vari;
    })
    padding: variable.IVariable<IPadding>



    public onAttached(){
        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.padding = "0";
        this.element.style.margin = "0";
        this.element.style.border = "none";
        this.conte = html.context(this.element);
    }

    public render(ctx: html.IHtmlRenderContext){
        this.element.style.left = this.x+"px";
        this.element.style.top = this.y+"px";
        this.element.style.width = this.width+"px";
        this.element.style.height = this.height+"px";
        ctx.push(this.element);
        var c =
        this.shapes.forEach(s => s.render(this.conte));
        this.conte.stop();
    }

    public onDetached(){
        this.shapes.forEach(s => s.onDetached());
    }

    public getExampleLabel(): IDimension{
        return this.exampleLabel;
    }

    public attr: any;

    get height(){
        return this.r_height.value;
    }

    set height(v){
        this.r_height.value = v;
    }

    get width(){
        return this.r_width.value;
    }

    set width(v){
        this.r_width.value = v;
    }

    get y(){
        return this.r_y.value;
    }

    set y(v){
        this.r_y.value = v;
    }

    get x(){
        return this.r_x.value;
    }

    set x(v){
        this.r_x.value = v;
    }

    private storedPositions: {[s: string]: ILabelResult} = {};

    get side(){
        return this.gridSettings.position;
    }

    constructor(settings: ICartesianChartAxisLabelSettings, gridSettings: IRelativePositionedGridElement){
        this.settings = settings;
        this.gridSettings = gridSettings;
    }

    public htmlGroup: HTMLRect;
    public svgGroup: SVGRectangle;

    public cancel(){
        this.cancels.forEach(c => c.cancel());
        this.cancels = [];
    }

    public inited = false;

    @init
    public init(){
        var self = this;
        var cancel = add(this, {
            get value(){
                return self.axisChart.value.yAxes;
            }
        }, {
            get value(){
                return self.axisChart.value.xAxes;
            }
        });
        this.cancels.push(cancel);

        var proc = procedure(p => {
            var rs = getRectangleSide(this.side);
            this.layout = createPositioned4SideRectangleLayouter({
                side: rs
            });
            this.ivl = getRectangleOppositeSideIntervalProvider(rs);
            this.ptProvider = getYCoordinatePointPositionProvider(rs);
        });
        this.cancels.push(proc);
        this.mapValue = (x: number) => this.mapperMatrix().transform(x);
    }

    private getLabelDimensions(l: IPositionedLabel): IDimension{
        if (typeof l.label === "string"){
            var svgComp = svgComponentLabel(this.style.value, l.label);
            var svgShape = <svg.ISvgShape>svg(svgComp);
            var ctx = html.context(this.chart.chartSVG.node.element);
            ctx.index = this.chart.chartSVG.node.element.childNodes.length;
            svgShape.render(ctx);
            ctx.pop();
            ctx.stop();
            var res = {
                width: svgComp.width,
                height: svgComp.height
            }
            return res;

        }
        else {
            var htm = <html.IHtmlShape>html(<html.IHtmlShapeTypes>l.label);
            this.chart.node.element.appendChild(htm.element);
            htm.onAttached && htm.onAttached();
            var cr = (<HTMLElement>htm.element).getBoundingClientRect();
            var res = {
                width: cr.width,
                height: cr.height
            }
            this.chart.node.element.removeChild(htm.element);
            return res;
        }
    }
    
    private renderLabel(l: IPositionedLabel): ILabelResult{
        var lbl: IRectangle;
        var cancel: () => void;
        if (typeof l.label === "string"){
            var svgC = svgComponentLabel(this.style.value, l.label);
            lbl = svgC;
            if (!this.svgGroup){
                this.svgGroup = new SVGRectangle(this);
                this.shapes.push(html(this.svgGroup));
            }
            var shape = html(svgC);
            (<HTMLElement>(<html.IHtmlShape>shape).element).style.position = "absolute";
            this.svgGroup.child.push(shape);
            cancel = () => {
                this.svgGroup.child.remove(this.svgGroup.child.indexOf(shape));
            }
        }
        else {
            var htmlC = new HTMLComponent(variable.transformProperties({
                html: l.label,
                x: 0,
                y: 0
            }));
            lbl = htmlC;
            var shape = html(htmlC);
            this.shapes.push(shape);
            cancel = () => {
                this.shapes.splice(this.shapes.indexOf(shape), 1);
                shape.onDetached();
            }
        }
        (<any>lbl).position = l.position;
        return {
            label: lbl,
            cancel: cancel,
            labelText: l.label
        }
    }
    
    private isEqualLabel(l1: LabelType, l2: LabelType){
        var i1 = typeof l1;
        var i2 = typeof l2;
        if (i1 !== i2){
            return false;
        }
        if (i1 === "string"){
            return l1 === l2;
        }
        return true;
    }
    
    public generate(): IFitnessAndRectangles{
        if (!this.inited){
            this.inited = true;
            this.init();        
        }
        if (!this.chart.chartSVG.node || !this.chart.chartSVG.node){
            return {
                fitness: "FIT",
                rectangles: []
            }
        }
        var lgit = this.labelGenerator.iterator();
        var nit = iterator(iterator(lgit).filter(l => l !== null)).map(l => {
            var dims = this.cache.get(l.position+"");
            var lbl: ILabelResult;
            if (!dims || !this.isEqualLabel(dims.label, l.label)){
                var d = this.getLabelDimensions(l);
                dims = {
                    width: Math.max(10, d.width),
                    height: Math.max(5, d.height),
                    label: l.label
                }
                this.cache.set(l.position+"", dims);
            }
            var prev = new RectanglePreview(dims, l, lbl);
            prev.position = this.mapValue(l.position);
            var padded = labelToPadded(prev, this.padding.value);
            return padded;
        })
        var layouted = this.layout(nit);
        removeNegativeStart(mapIterator(arrayIterator(layouted.rectangles), r => this.ivl(r)));
        return layouted;
    }
    
    private getLabelFromPreview(prev: PaddedPositionedLabel){
        var lbl: ILabelResult;
        if ((<RectanglePreview>prev.label).shape){
            lbl = (<RectanglePreview>prev.label).shape;
        }
        else {
            lbl = this.renderLabel((<RectanglePreview>prev.label).posLabel)
        }
        lbl.label.x = (<RectanglePreview>prev.label).x;
        lbl.label.y = (<RectanglePreview>prev.label).y;
        return lbl;
    }

    public exampleLabel: IDimension;

    private applyLabels(labels: PaddedPositionedLabel[]){
        var newPos: {[s: string]: ILabelResult} = {};
        var res: ILabelResult[] = [];
        var s: LabelType[] = [];
        for (var i=0; i < labels.length; i++){
            var lbl = labels[i];
            this.exampleLabel = lbl;
            var pos = (<RectanglePreview>lbl.label).posLabel.position;
            var comp: ILabelResult = this.storedPositions[pos];
            s.push((<RectanglePreview>lbl.label).posLabel.label);
            if (!comp || !this.isEqualLabel(comp.labelText, (<RectanglePreview>lbl.label).posLabel.label)){
                if (comp){
                    comp.cancel();
                }
                comp = this.getLabelFromPreview(lbl);
            }
            newPos[pos] = comp;
            res.push(comp);
            comp.label.x = Math.round(lbl.label.x);
            comp.label.y = Math.round(lbl.label.y);
        }
        for (var k in this.storedPositions){
            if (!(k in newPos)){
                var comp = this.storedPositions[k];
                comp.cancel();
            }
        }
        this.storedPositions = newPos;
    }

    public consume(labels: IRectangleLabel[]){
        this.applyLabels(<PaddedPositionedLabel[]><any[]>labels);
        var size = 0;
        labels.forEach(l => {
            size = Math.max(this.ivl(l).size, size);
        });
        this.ivl(this).size = Math.ceil(size);
    }

}