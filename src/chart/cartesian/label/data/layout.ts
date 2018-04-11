/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianSeries, IXYSeriesSystem} from "../../series/series";
import {ICartesianChart} from "../../index";
import {HashMap} from "../../../../collection/hash";
import {ITransformation} from "../../../../math/transform/matrix";
import {IReactiveRingBuffer} from "../../../reactive/collection/ring";
import {IRectangle} from "../../../../geometry/rectangle/index";
import {lru} from "../../../../collection/cache/lru/index";
import {Constructor, extend, hash} from "@reactivelib/core";
import {spanningFromCollection} from "../../../../geometry/rectangle/array";
import {arrayIterator} from "../../../../collection/iterator/array";
import {IGlobalChartSettings} from "../../../style";
import {ICancellable, transaction, procedure, variable} from "@reactivelib/reactive";
import {RTree} from "../../../../collection2d/rtree";
import {IShapeDataHolder} from "../../../data/shape/transform/index";
import {ChartCenter} from "../../../core/center/index";
import {html} from "@reactivelib/html";
import {ILabelStyle} from "../../../render/canvas/label/cache/index";
import {HTMLComponent} from "../../../render/html/component";
import {svgComponentLabel} from "../../../render/html/svg/component";
import {measureShapeDimensions} from "../../../render/html/measure";
import {deps} from "../../../../config/di";

export type DataLabelPositions = "center" | "top" | "bottom" | "left" | "right";

/**
 * A function that renders labels for data.
 */
export interface IDataLabelRendererFunction
{
    /**
     * Renders a label for the given data.
     * @param data The data to render the label for
     * @param series The series this data is found at.
     * @returns Either a string or a @api{render.canvas.IComponent, component}
     */
    (data: any, series: ICartesianSeries): html.IHtmlShapeTypes | string;
}

/**
 * Settings on how to render data labels for a series.
 * @settings
 */
export interface IDataLabelSettings{

    /**
     * Defines how to render the data.
     * 
     * 
     * |value|description|
     * |--|--|
     * |"value"|Will render the value of the data, e.g. if data is a point {x: 1, y:2}, will render label "2"|
     * |"auto"|Will render the the label if it is defined in the data, otherwise will render the value of the data
     * |"label"|Will render the label that is defined in the data, e.g. for point data {x:1, y:2, l: "label"} will render "label".
     * |@api{IDataLabelRendererFunction}|Will use this given function to render the label
     */
    render?: "value" | "label" | "auto" | IDataLabelRendererFunction;
    /**
     * Determines were the label will be positioned relative to the shape bounding box. Defaults to "center".
     */
    position?: DataLabelPositions | DataLabelPositions[];
    /**
     * Adds an offset to the x-position of the label
     */
    xOffset?: number;
    /**
     * Adds an offset to the y-position of the label
     */
    yOffset?: number;
    /**
     * If true, labels are allowed to overlap. If false, labels that would overlap will not be rendered.
     */
    overlap?: boolean;
    /**
     * Style of the labels.
     */
    style?: ILabelStyle;
    delay?: number;
    
}

function renderByLabel(data: any, series: ICartesianSeries){
    if (!data.l){
        return null;
    }
    if (typeof data.l === "string"){
        return data.l;
    }
    return new HTMLComponent(variable.transformProperties({
        html: data.l,
        x: 0,
        y: 0
    }))
}

function renderByValue(data: any, series: ICartesianSeries){
    if (series.dataType === "point"){
        return data.y+"";
    }
    if (series.dataType === "interval"){
        return data.ys+" - "+data.ye;
    }
    return null;
}

var typeToRenderer = {
    label: renderByLabel,
    value: renderByValue,
    auto: function(data: any, series: ICartesianSeries){
        var lbl = renderByLabel(data, series);
        if (!lbl){
            return renderByValue(data, series);
        }
        return lbl;
    }
}

function getRenderer(renderer: "value" | "label" | "auto" | IDataLabelRendererFunction): IDataLabelRendererFunction{
    if (!renderer){
        renderer = "auto";
    }
    if (typeof renderer !== "string"){
        return renderer;
    }
    if (renderer in typeToRenderer){
        return typeToRenderer[renderer];
    }
    else {
        throw new Error("Invalid option "+renderer+" for label renderer");
    }
}

class LabelLayouter{
    
    public dataToLabel = new HashMap<any, {data: any, label: IRectangle, cancel: ICancellable}>();
    public dataToBoundingBox = new HashMap<any, IRectangle>();
    public boundingBox: IRectangle[] = [];
    public dataToLabelDimensions = lru<IRectangle>();
    
    public render(data: any, series: ICartesianSeries): html.IHtmlShapeTypes | string{
        return null;
    }
    
    public data: any;
    public index: number;
    public label: IRectangle;
    public chart: ICartesianChart;
    public centerTransform: ITransformation;
    public style: ILabelStyle;
    private lastTimeout: any = null;
    public delay = 300;
    
    constructor(public series: IXYSeriesSystem, public center: ChartCenter){
        this.dataToLabelDimensions.capacity = 1000;
    }
    
    public setTimeout(f: () => void){
        if (this.delay > 0){
            return setTimeout(f, this.delay);
        }
        else
        {
            f();
            return null;
        }
    }

    public cancel(){
        if (this.lastTimeout){
            clearTimeout(this.lastTimeout);
            for (var kv in this.dataToLabel.objects){
                this.dataToLabel.objects[kv].value.cancel.cancel();
            }
        }
    }
    
    public layoutChart(){
        var modified = false;
        this.series.area.mapper;
        var sd = <IReactiveRingBuffer<IShapeDataHolder<any>>>this.series.shapeData;
        var l = sd.length;
        var newBounds: IRectangle[] = [];
        for (var i=0; i < l; i++){
            this.index = i;
            var bb = getBoundingBox(this.series, this.series.shapeDataProvider.shapeToDataIndex(i));
            bb.x = Math.round(bb.x);
            bb.y = Math.round(bb.y);
            bb.width = Math.max(1, Math.round(bb.width));
            bb.height = Math.max(1, Math.round(bb.height));
            newBounds.push(bb);
        }
        var datas = new HashMap<any, any>();
        var dbb = new HashMap<any, IRectangle>();
        for (var i=0; i < sd.length; i++){
            var data = sd.get(i).data;
            var nb = newBounds[i];
            var ob = this.dataToBoundingBox.get(data);
            if (ob){
                if (nb.x !== ob.x || nb.y !== ob.y || nb.width !== ob.width || nb.height !== ob.height){
                    modified = true;
                    var dataL = this.dataToLabel.get(data);
                    if (dataL){
                        if (this.delay > 0){
                            this.dataToLabel.remove(data);
                            dataL.cancel.cancel();
                        }
                        else {
                            dataL.label.x = nb.x;
                            dataL.label.y = nb.y;
                        }
                    }
                }
            }
            else
            {
                modified = true;
            }
            dbb.put(data, nb);
            datas.put(data, data);
        }
        var objs = this.dataToLabel.objects;
        var toRemove = [];
        for (var k in objs){
            if (!(k in datas.objects)){
                toRemove.push(objs[k].value.data);
            }
        }
        for (var i=0; i < toRemove.length; i++){
            var rdata = toRemove[i];
            var lblc = this.dataToLabel.get(rdata);
            this.dataToLabel.remove(rdata);
            lblc.cancel.cancel();
        }
        this.boundingBox = newBounds;
        this.dataToBoundingBox = dbb;
        if (modified){
            if (this.lastTimeout){
                clearTimeout(this.lastTimeout);
            }
            this.lastTimeout = this.setTimeout(() => {
                transaction(() => {
                    var sd = this.series.shapeDataProvider;
                    var bounds = this.boundingBox;
                    var addedData = new HashMap<any, any>();
                    for (var i=0; i < bounds.length; i++){
                        var bb = bounds[i];
                        var data =  (<IReactiveRingBuffer<IShapeDataHolder<any>>>this.series.shapeData).get(i).data;
                        var dims = this.dataToLabelDimensions.get(hash(data));
                        if (!dims){
                            dims = <IRectangle>this.measureLabel(data);
                            this.dataToLabelDimensions.set(hash(data), dims);
                        }
                        var nbl = this.layoutLabel(dims, bb);
                        if (nbl){
                            addedData.put(data, data);
                            var dl = this.dataToLabel.get(data);
                            if (dl){
                                dl.label.x = nbl.x;
                                dl.label.y = nbl.y;
                            }
                            else {
                                var lab = this.createLabel(data);
                                dl = {
                                    data: data, label: lab.label, cancel: lab.cancel
                                }
                                dl.label.x = nbl.x;
                                dl.label.y = nbl.y;
                                this.dataToLabel.put(data, dl);
                            }
                        }
                        else
                        {
                            var dl = this.dataToLabel.get(data);
                            if (dl){
                                this.dataToLabel.remove(data);
                                dl.cancel.cancel();
                            }
                        }
                    }
                    var objs = this.dataToLabel.objects;
                    var toRemove = [];
                    for (var nd in objs){
                        if (!(nd in addedData.objects)){
                            toRemove.push(objs[nd].value.data);
                        }
                    }
                    for (var i=0; i < toRemove.length; i++){
                        var d = toRemove[i];
                        var dl = this.dataToLabel.get(d);
                        this.dataToLabel.remove(d);
                        dl.cancel.cancel();
                    }
                    this.lastTimeout = null;
                });
            });
        }
    }

    private measureLabel(data: any){
        var res =  this.render(data, this.series);
        if (!res){
            return null;
        }
        if (typeof res === "string"){
            return measureShapeDimensions(() => {
                return <html.IHtmlShape>html(svgComponentLabel(this.style, res));
            }, this.center.getLayer(10).getSvg().node.element);
        }
        else {
            return measureShapeDimensions(() => {
                return <html.IHtmlShape>html(new HTMLComponent({
                    html: res,
                    x: 0,
                    y: 0
                }));
            }, this.center.getLayer(10).node.element);
        }
    }
    
    private createLabel(data: any){
        var res =  this.render(data, this.series);
        if (!res){
            return null;
        }
        var cancel: ICancellable;
        if (typeof res === "string"){
            var lc = svgComponentLabel(this.style, res);
            var c = this.center.getLayer(10).getSvg().child;
            c.push(lc);
            var lbl: IRectangle = lc;
            cancel = {
                cancel: () => {
                    c.remove(c.indexOf(lc));
                }
            }
        }
        else {
            lbl = new HTMLComponent(variable.transformProperties({
                html: res,
                x: 0,
                y: 0
            }));
            var c = this.center.getLayer(10).child;
            c.push(<any>lbl);
            cancel = {
                cancel: () => {
                    c.remove(c.indexOf(<any>lbl));
                }
            }
        }
        return {
            label: lbl,
            cancel: cancel
        };
    }
    
    public layoutLabel(label: IRectangle, bb: IRectangle): IRectangle{
        return label;
    }
    
}

function getBoundingBox(series: IXYSeriesSystem, index: number){
    return spanningFromCollection(arrayIterator(series.findShapesForIndex(index).map(s => s.getScreenBoundingBox())));
}

function layoutCenter(layouter: LabelLayouter, label: IRectangle, offsetX: number, offsetY: number, bb: IRectangle){
    var cx = Math.round(bb.x + bb.width / 2);
    var cy = Math.round(bb.y + bb.height / 2);
    var pt = {
        x: Math.round(cx - label.width / 2) + offsetX,
        y: Math.round(cy - label.height / 2) + offsetY
    }
    pt = {x: pt.x, y: pt.y};
    label.x = pt.x; 
    label.y = pt.y;
}

function layoutTop(layouter: LabelLayouter, label: IRectangle, offsetX: number, offsetY: number, bb: IRectangle){
    var cx = Math.round(bb.x + bb.width / 2);
    var cy = Math.round(bb.y);
    var pt = {x: Math.round(cx - label.width / 2) + offsetX, y: Math.round(cy - label.height) + offsetY};
    label.x = pt.x;
    label.y = pt.y;
}

var posToLayouter = {
    center: layoutCenter,
    top: layoutTop
}

function asPositions(layouter: any, positions: DataLabelPositions[], offsetX: number, offsetY: number){
    var ly = layouter.prototype.layoutLabel;
    var layouters = positions.map(pos => {
        switch(pos){
            case "center":
                return posToLayouter.center;
            case "top":
                return posToLayouter.top;
            default:
                throw new Error("Unknown position "+pos);
        }
    });
    layouter.prototype.layoutLabel = function(lbl: IRectangle, bb: IRectangle){
        for (var i=0; i < layouters.length; i++){
            var layouter = layouters[i];
            layouter(this, lbl, offsetX, offsetY, bb);
            lbl = ly.call(this, lbl);
            if (lbl){
                return lbl;
            }
        }
        return null;
    }
}

function asOverlapRemoving(layouter: Constructor<LabelLayouter>){
    var layoutChart = layouter.prototype.layoutChart;
    layouter.prototype.layoutChart = function(chart: ICartesianChart){
        this.rtree = new RTree();
        layoutChart.call(this, chart);
    }
    var layoutLabel = layouter.prototype.layoutLabel;
    layouter.prototype.layoutLabel = function(label: IRectangle){
        var lbl = layoutLabel.call(this, label);
        if (!lbl){
            return null;
        }
        var bounds = {
            xs: lbl.x,
            ys: lbl.y,
            xe: lbl.x + lbl.width,
            ye: lbl.y + lbl.height
        };
        if (this.rtree.findOverlapping(bounds).length > 0){
            return null;
        }
        this.rtree.add(bounds);
        return lbl;
    }
}


export function createLabelLayouter(settings: IDataLabelSettings, series: IXYSeriesSystem, center: ChartCenter, theme: IGlobalChartSettings){
    class LL extends LabelLayouter{
        
    }
    var style = extend({}, theme.font, theme.dataLabels.style, settings.style);
    settings = extend({}, theme.dataLabels, settings, {
        style: style
    });
    if (!("overlap" in settings) || !settings.overlap){
        asOverlapRemoving(LL);
    }
    var positions: DataLabelPositions[] = ["center"];
    if (Array.isArray(settings.position)){
        positions = settings.position;
    }
    else if (settings.position){
        positions = [settings.position];
    }
    asPositions(LL, positions, settings.xOffset || 0, settings.yOffset || 0);
    var layouter = new LL(series, center);
    layouter.style = settings.style;
    layouter.render = getRenderer(settings.render);
    if ("delay" in settings){
        layouter.delay = settings.delay;
    }
    center.getLayer(10).getSvg();
    var proc = procedure.animationFrame(() => {
        layouter.layoutChart();
    });
    return {
        cancel: () => {
            proc.cancel();
        }
    }
}

deps(createLabelLayouter, ["settings", "series", "center", "theme"]);
