/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CartesianSeries, ICartesianSeries, IXYSeriesSystem} from "../series/series";
import {IRectangle, rectangleDistance as rectangle2dDistance} from "../../../geometry/rectangle/index";
import {ICancellable, nullCancellable, procedure, variable} from "@reactivelib/reactive";
import {XYChart} from "../index";
import {mapRectangle} from "../../../math/transform/geometry";
import {spanningFromCollection} from "../../../geometry/rectangle/array";
import {arrayIterator} from "../../../collection/iterator/array";
import {iterator} from "../../../collection/iterator/index";
import {ISeriesShape} from "../../series/render/base";
import {MultiStarter} from "../../../config/start";
import {IShapeDataHolder} from "../../data/shape/transform/index";
import {ICartesianChartDataHighlightSettings} from "../highlight/data";
import focusPoint, {TrackedFocusPoint} from "./point";
import {component, create, init, inject} from "../../../config/di";
import focusArea from './area';
import {rectangleDistance, rectangleXDistance, rectangleYDistance} from "../../../geometry/rectangle";
import highlight from './highlight';

/**
 * The data that is in the focus
 */
export interface ISeriesFocusData{

    series: ICartesianSeries;
    /**
     * The index the data is at
     */
    index: number;
    data: any;
    screenBoundingBox: IRectangle;
}

export interface IXYFocus{

    /**
     * True if (mouse) cursor is over the shape visualizing the nearest data
     */
    isOver?: boolean;
    focusedData: ISeriesFocusData[];
    nearestData: ISeriesFocusData;
    screenDataBoundingBox: IRectangle;
    addEventListener(type: string, listener: (data: ISeriesFocusData) => void): ICancellable;

}

/**
 * How to highlight the focused data.
 */
export interface IFocusHighlightSettings extends ICartesianChartDataHighlightSettings{
    /**
     * A filter to determine what data to include into the highlight
     */
    filter?: (data: ISeriesFocusData[]) => ISeriesFocusData[];
}

/**
 * Configuration of the chart focus. The focus determines what data will be highlighted and shown in a tooltip when the user moves the mouse.
 * @settings
 *
 */
export interface IXYFocusSettings{

    /**
     * The data to include into the focus. Either include all data inside the focus or the nearest
     * in respect to the cursor position.
     */
    include?: "all" | "nearest" | "default";
    /**
     * A filter to determine what data to include into the focus.
     */
    filter?: (data: ISeriesFocusData[]) => ISeriesFocusData[];

    highlight?: IFocusHighlightSettings;

    share?: IXYFocus;

}

@component("focus")
export class XYFocus implements IXYFocus{

    @create(function(this: XYFocus){
        return focusArea(this.chart, this.chart.center, this.r_focusPoint);
    })
    public focusArea: variable.IVariable<IRectangle>;
    private r_isOver = variable<boolean>(false);
    private r_isOverCursor = variable<boolean>(false);

    @inject
    chart: XYChart

    @create(function(this: XYFocus){
        var res = variable<IXYFocusSettings>(null).listener(v => {
            v.value =  (<IXYFocusSettings>this.chart.settings.focus) || {};
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    focusSettings: variable.IVariable<IXYFocusSettings>;

    @create(function(this: XYFocus){
        var res = variable<XYFocus>(null).listener(v => {
            var setttings = this.focusSettings.value;
            if (setttings.share){
                v.value = <XYFocus>setttings.share;
            }
            else{
                v.value = null;
            }
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    masterFocus: variable.IVariable<XYFocus>;

    addEventListener(type: string, listener: (data: ISeriesFocusData) => void): ICancellable{
        return nullCancellable;
    }
    
    get isOverCursor(){
        return this.r_isOverCursor.value;
    }
    
    set isOverCursor(v){
        this.r_isOverCursor.value = v;
    }
    
    get isOver(){
        return this.r_isOver.value;
    }
    
    set isOver(v){
        this.r_isOver.value = v;
    }

    @create(function(this: XYFocus){
        return focusPoint(this, this.masterFocus, this.chart.settings, this.chart.center, this.chart);
    })
    public r_focusPoint: variable.IVariable<TrackedFocusPoint>;
    get focusPoint(){
        return this.r_focusPoint.value;
    }
    set focusPoint(v){
        this.r_focusPoint.value = v;
    }

    @create(function(this: XYFocus){
        var res = variable<(r1: IRectangle, r2: IRectangle) => number>(null).listener(v => {
            if (this.chart.type === "x"){
                if (this.chart.yAxes.origin === "left" || this.chart.yAxes.origin === "right"){
                    v.value = rectangleYDistance;
                    return;
                }
                else {
                    v.value = rectangleXDistance;
                    return;
                }
            }
            v.value = rectangleDistance;
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    rectangleDistance: variable.IVariable<(r1: IRectangle, r2: IRectangle) => number>

    @create(function(this: XYFocus){
        var res = variable<(data: ISeriesFocusData[]) => ISeriesFocusData[]>(null).listener(v => {
            v.value = this.focusSettings.value.filter || ((data) => data);
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    filter: variable.IVariable<(data: ISeriesFocusData[]) => ISeriesFocusData[]>

    @create(function(){
        var res = variable<IRectangle>(null).listener(v => {
            if (this.chart.settings.type === "x" && this.chart.xAxes.primary.type === "discrete"){
                var area = this.chart.viewports.primary;
                var rect = this.focusArea.value;
                if (!rect){
                    v.value = null;
                    return;
                }
                var tr = area.mapper;
                var itr = tr.copy().inverse();
                if (!itr.present){
                    v.value = rect;
                    return;
                }
                var ur = mapRectangle(rect, itr.value);
                ur.x = Math.round(ur.x) - 0.5;
                ur.width = Math.round(ur.x + ur.width) + 0.5 - ur.x;
                v.value =  mapRectangle(ur, tr);
                return;
            }
            v.value = this.focusArea.value;
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    extendedArea: variable.IVariable<IRectangle>
    
    private r_focusedData = variable<ISeriesFocusData[]>([]);
    private r_nearestData = variable<ISeriesFocusData>(null);
    private r_screenDataBoundingBox = variable<IRectangle>(null);
    public target: ISeriesShape;

    get screenDataBoundingBox(){
        return this.r_screenDataBoundingBox.value;
    }

    set screenDataBoundingBox(v){
        this.r_screenDataBoundingBox.value = v;
    }

    get nearestData(){
        return this.r_nearestData.value;
    }

    set nearestData(v){
        this.r_nearestData.value = v;
    }

    get focusedData(){
        return this.r_focusedData.value;
    }

    set focusedData(v){
        this.r_focusedData.value = v;
    }

    @init
    init(){
        startFocus(this.chart, this, this.rectangleDistance, this.filter, this.focusSettings, this.extendedArea, this.chart.starter);
        highlight(this, this.chart, this.focusSettings, this.chart.starter);
    }

}

class SeriesNearestDataCollector{

    public res: ISeriesFocusData[] = [];
    public rects: IRectangle[] = [];
    private minDist = Number.MAX_VALUE;

    public add(data: ISeriesFocusData, dist: number, rect: IRectangle) {
        var distance = Math.abs(dist - this.minDist);
        if (distance < 1){
            this.res.push(data);
            this.rects.push(rect);
        }
        else if (dist < this.minDist){
            this.res = [data];
            this.rects = [rect];
            this.minDist = dist;
        }
        
    }
}

function findNearestData(datas: ISeriesFocusData[], pos: IRectangle, rectangleDistance: (r1: IRectangle, r2: IRectangle) => number){
    var n = datas[0];
    var dist = rectangleDistance(pos, n.screenBoundingBox);
    for (var i=1; i < datas.length; i++){
        var c = datas[i];
        var nd = rectangleDistance(pos, c.screenBoundingBox);
        if (nd < dist){
            dist = nd;
            n = c;
        }
    }
    return n;
}

function empty(f: IXYFocus){
    f.focusedData = [];
    f.nearestData = null;
    f.screenDataBoundingBox = null;
}

export function startFocus(chart: XYChart, focus: XYFocus, rectangleDistance: variable.IVariable<(r1: IRectangle, r2: IRectangle) => number>,
                           filter: variable.IVariable<(data: ISeriesFocusData[]) => ISeriesFocusData[]>, focusSettings: variable.IVariable<IXYFocusSettings>,
                           extendedArea: variable.IVariable<IRectangle>, starter: MultiStarter): IXYFocus{
    starter.add(() => {
            var lastData: ISeriesFocusData = null;
            var lastShape: ISeriesShape = null;
            return procedure(() => {
                var focusRect = extendedArea.value;
                focus.isOver = focus.focusPoint.target !== null;
                if (focus.focusPoint.focus === focus){
                    focus.target = focus.focusPoint.target;
                }                
                else{                
                    if (focus.focusPoint.target){
                        focusRect = null;
                    }
                    focus.target = null;
                }
                if (focusRect){
                    var targ = focus.target;
                    var include = focusSettings.value.include;
                    if (!include){
                        include = "default";
                    }
                    if (focus.target && include === "default"){
                        if (lastShape !== targ){
                            var sbb = targ.getScreenBoundingBox();
                            lastData = {
                                data: (<IShapeDataHolder<any>>targ.data).data,
                                screenBoundingBox: sbb,
                                index: (<IXYSeriesSystem>targ.series).shapeDataProvider.shapeToDataIndex((<any>targ).index),
                                series: <ICartesianSeries>targ.series
                            }
                            focus.nearestData = lastData;
                            focus.focusedData = [lastData];
                            focus.screenDataBoundingBox = sbb;
                        }
                        lastShape = targ;
                        lastData = null;
                    }
                    else {
                        lastShape = null;
                        var coll = new SeriesNearestDataCollector();
                        chart.series.collection.forEach((ser: CartesianSeries) => {
                            var datas = ser.findNearestData(focusRect);
                            var tr = ser.area.mapper;
                            datas.forEach(data => {
                                var bb = ser.getDataBoundingBox(data.data);
                                bb = mapRectangle(bb, tr);
                                var shapes = ser.findShapesForIndex(data.index);
                                var sbb = spanningFromCollection(arrayIterator(shapes.map(s => s.getScreenBoundingBox())));
                                data.screenBoundingBox = sbb;
                                coll.add(data, rectangleDistance.value(focusRect, bb), sbb);
                            });
                        });
                        var d = filter.value(coll.res);
                        if (d.length === 0){
                            empty(focus);
                            lastData = null;
                            return;
                        }
                        var p = focus.focusPoint.windowPosition || {x: -1000, y: -1000};
                        var cr = chart.center.calculateBoundingBox();
                        var nd = findNearestData(d, {
                            x: p.x - cr.left,
                            y: p.y - cr.top,
                            width:0,
                            height: 0
                        }, rectangle2dDistance);
                        if (include === "nearest"){
                            d = [nd];
                        }
                        var rect = spanningFromCollection(iterator(arrayIterator(d)).map(d => d.screenBoundingBox));
                        focus.nearestData = nd;
                        focus.focusedData = d;
                        focus.screenDataBoundingBox = rect;
                        lastData = focus.nearestData.data;
                    }
                }
                else {
                    empty(focus);
                    lastData = null;
                }
            });
    });
    return focus;
}