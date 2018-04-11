/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {AbstractSeries, ISeries, ISeriesSettings} from "../../series/index";
import {IOptional} from "@reactivelib/core";
import {ICancellable, node, nullCancellable, optional, procedure, unobserved, variable} from "@reactivelib/reactive";
import {IRectangle} from "../../../geometry/rectangle/index";
import {IXYAxis} from "../axis/index";
import {ICartesianViewport, XYAreaSystem} from "../area/index";
import {ISeriesFocusData} from "../focus/index";
import {IReactiveRingBuffer, ReactiveXSortedRingBuffer} from "../../reactive/collection/ring";
import {ISeriesShape} from "../../series/render/base";
import {IDataLabelSettings} from "../label/data/layout";
import {IDataHighlighter} from "./render/data/highlight/highlight";
import {MultiStarter} from "../../../config/start";
import {IShapeDataHolder} from "../../data/shape/transform/index";
import {IShapeDataProvider} from "../../data/shape/cartesian/offset";
import {getEndX, IXIndexedData, IXIntervalData} from "../../../datatypes/range";
import {IDataHighlightSettings} from "../../series/render/highlight";
import {findOrCreateGroup, ISeriesGroup, ISeriesGroupable} from "./group";
import {IColorScale} from "../../render/canvas/scale/color/index";
import {IRadiusScale} from "../../render/canvas/scale/radius/index";
import {ISeriesMaxDomain, ReactiveSeriesMaxDomain} from "./domain";
import {IEasingSettings} from "../../../animation/ease";
import {IHighlightable} from "../../render/style/highlight";
import {ISeriesRendererSettings} from "./render";
import {buildAndFetch, buildFactories, create, define, init, inject, join} from "../../../config/di";
import {XYChart} from "../index";
import {SeriesDataLabelFactories} from "../label/data/factory";
import {ISeriesRadiusScaleSystem, RadiusScaleCollection} from "../../render/canvas/scale/radius";
import {ColorScaleCollection} from "../../render/canvas/scale/color";
import createIntervalData from "./data/interval/data";
import createCandleData from "./data/candle/data";
import xyData from "./data/xy";
import createValueData from "./data/value/data";
import {ISeriesTableEntry} from "../data/parse";
import domain from './domain/factory';
import {SeriesStackManager} from "./stack";
import {StackedShapesDataManager} from "../../data/shape/cartesian/transformer/x/stacking";
import origin from './origin';
import {PointHighlighterFactories} from "./render/point/highlight/factory";
import {IntervalHighlighterFactories} from "./render/interval/highlight/factory";
import {CandleHighlighterFactories} from "./render/candle/highlight/factory";
import {xyHighlighter} from "./highlighter";
import {findShapesForIndex, findShapesForIndexXY} from "./findShapesForIndex";
import findNearest from './findNearest';
import {IntervalGroupSeriesRenderer} from "./render/interval/factory";
import {CandleGroupSeriesRenderer} from "./render/candle/factory";
import {XYPointSeriesRenderer} from "../xy/series/render";
import {GroupSeriesRenderer} from "../../series/render/group";
import {ValueGroupSeriesRenderer} from "./render/value/factory";
import {createCategoricalContext, getShapeInterval, IDiscreteContext} from "./render/position";
import {DiscreteTicks} from "../../../math/domain/marker/categorical";
import {ICategoryManager} from "../categorical/positioning";
import {IInterval} from "../../../geometry/interval";
import {ICartesianXPoint} from "../../../datatypes/value";
import {ICandlestick} from "../../../datatypes/candlestick";
import {ICartesianXInterval} from "../../../datatypes/interval";
import {CartesianShapeData} from "../../data/shape/cartesian";

export interface IXYSeriesData{
    index: number;
    series: ICartesianSeries;
}

export type CartesianDataTypes = "candle" | "point" | "interval";

/**
 * A series that is visualized inside a cartesian chart.
 */
export interface ICartesianSeries extends ISeries, IHighlightable, ISeriesGroupable{

    globalSettings: ICartesianSeriesSettings;

    settings: ICartesianSeriesSettings;

    /**
     * The viewport this series is drawn onto.
     */
    area: ICartesianViewport;
    /**
     * The maximally visible data window
     */
    domain: ISeriesMaxDomain;
    /**
     * The x-axis this series is using
     */
    xAxis: IXYAxis;
    /**
     * The data this series contains. The type depends on the @api{ICartesianSeriesSettings.dataType} settings
     */
    data: IReactiveRingBuffer<any>;
    /**
     * The y-axis this series is using
     */
    yAxis: IXYAxis;
    /**
     * The type of data this series is storing. See @api{ICartesianSeriesSettings.dataType} 
     */
    dataType: CartesianDataTypes;
    /**
     * @ignore
     */
    summarizedData: IReactiveRingBuffer<any>;
    /**
     * @ignore
     * The bounding box of the given data
     * @param data 
     */
    getDataBoundingBox(data: any): IRectangle;
    colorScale: IOptional<IColorScale>;
    radiusScale: IOptional<IRadiusScale>;

}


export class CartesianSeries extends AbstractSeries implements ICartesianSeries, IXYSeriesSystem{

    @define
    public settings: ICartesianSeriesSettings;
    @define
    public globalSettings: ICartesianSeriesSettings;

    constructor(settings: ICartesianSeriesSettings, globalSettings: ICartesianSeriesSettings, globalData: ISeriesTableEntry){
        super(settings, globalSettings);
        this.globalData = globalData
    }

    @inject
    stackManager: SeriesStackManager

    @define
    seriesReactive = node()

    @define
    globalData: ISeriesTableEntry

    @inject
    colorScales: ColorScaleCollection

    @create
    public colorScale: IOptional<IColorScale>;
    create_colorScale(){
        var res = optional<IColorScale>();
        var prc = procedure(p => {
            var scale = this.settings.colorScale || this.globalSettings.colorScale;
            if (scale){
                var cs = this.colorScales.get(scale);
                if (cs){
                    res.value = cs;
                    return;
                }
                if (!cs && scale === "default"){
                    cs = this.colorScales.add({
                        type: "direct",
                        id: "default"
                    });
                    res.value = cs;
                    return;
                }
                res.empty();
            }
        });
        this.cancels.push(prc);
        return res;
    }


    @create
    stack: IOptional<StackedShapesDataManager<any>>
    create_stack(){
        var opt = optional();
        var proc = procedure(() => {
            var set = this.settings.xBucket || this.globalSettings.xBucket;
            if (set && set.placement === "stack"){
                opt.value = this.stackManager.getStack(set.stack || "default");
            }
            else{
                opt.empty();
            }
        });
        this.cancels.push(proc);
        return opt;
    }

    @inject
    radiusScales: RadiusScaleCollection

    @inject
    xCategoryManager: ICategoryManager
    @inject
    yCategoryManager: ICategoryManager

    @create
    xCategory: IOptional<IDiscreteContext>
    create_xCategory(){
        var res = optional();
        var lastCancel: ICancellable = nullCancellable;
        var prc = procedure(p => {
            lastCancel.cancel();
            if (this.xAxis.ticks instanceof DiscreteTicks){
                var xCatSets = this.settings.xBucket || this.globalSettings.xBucket || {};
                var xCat = createCategoricalContext(xCatSets);
                xCat.series = this;
                if (xCatSets.placement === "stack"){
                    xCat.stack = xCatSets.stack || "default";
                    xCat.shared = false;
                }
                else if (xCatSets.placement === "share"){
                    xCat.shared = true;
                }
                else
                {
                    xCat.stack = null;
                    xCat.shared = false;
                }
                this.xCategoryManager.add(xCat);
                res.value = xCat;
                lastCancel = {
                    cancel: () => this.xCategoryManager.remove(xCat)
                }
            }
            else {
                res.empty();
            }
        });
        this.cancels.push({
            cancel: () => {
                prc.cancel();
                lastCancel.cancel();
            }
        });
        return res;
    }

    @create
    yCategory: IOptional<IDiscreteContext>
    create_yCategory(){
        var res = optional();
        var lastCancel: ICancellable = nullCancellable;
        var prc = procedure(() => {
            lastCancel.cancel();
            if (this.yAxis.ticks instanceof DiscreteTicks){
                var ycat = createCategoricalContext(this.settings.yBucket || this.globalSettings.yBucket || {});
                ycat.series = this;
                this.yCategoryManager.add(ycat);
                res.value = ycat;
                lastCancel = {
                    cancel: () => this.yCategoryManager.remove(ycat)
                }
            }
            else {
                res.empty();
            }
        });
        this.cancels.push({
            cancel: () => {
                prc.cancel();
                lastCancel.cancel();
            }
        });
        return res;
    }


    @create
    getXBoundingInterval: (data: IXIntervalData) => IInterval
    create_getXBoundingInterval(){
        if (this.xCategory.present){
            return (data: IXIntervalData) => {
                var si = getShapeInterval(data.x, getEndX(data), this.xCategory.value);
                return {
                    start: si.xs, size: si.xe - si.xs
                }
            }
        }
        return (data: IXIntervalData) => {
            return {start: data.x, size: getEndX(data) - data.x};
        }
    }

    getValueDataBoundingBox(data: ICartesianXPoint){
        return {
            start: data.y,
            size: 0
        }
    }

    getIntervalDataBoundingBox(data: ICartesianXInterval){
        return {
            start: data.y,
            size: data.ye - data.y
        }
    }

    candlestickDataBoundingBox(data: ICandlestick){
        return {
            start: data.low,
            size: data.high - data.low
        }
    }

    @create
    getYBoundingInterval: (data: IXIntervalData) => IInterval
    create_getYBoundingInterval(){
        var res = variable<(data: IXIntervalData) => void>(null).listener(v => {
            switch(this.chart.type){
                case "xy":
                    v.value = this.getValueDataBoundingBox;
                    break;
                case "x":
                    switch(this.dataType){
                        case "point":
                            v.value = this.getValueDataBoundingBox;
                            break;
                        case "interval":
                            v.value = this.getIntervalDataBoundingBox;
                            break;
                        case "candle":
                            v.value = this.candlestickDataBoundingBox;
                            break;
                    }
            }
        });
        this.cancels.push(res.$r);
        return (data: IXIntervalData) => {
            return res.value(data);
        }
    }

    @create
    public radiusScale: IOptional<IRadiusScale>;
    create_radiusScale(){
        var res = optional<IRadiusScale>();
        var lastCancel: ICancellable = nullCancellable;
        var p = procedure(p => {
            if ("radiusScale" in this.settings){
                var rs = this.settings.radiusScale;
            }
            else {
                rs = this.globalSettings.radiusScale;
            }
            var sc = this.radiusScales.get(rs);
            if (!sc && rs === "default"){
                this.radiusScales.add({type: "auto", id: "default"});
            }
            sc = this.radiusScales.get(rs);
            if (!sc){
                res.empty();
                return;
            }
            if ((<ISeriesRadiusScaleSystem><any>sc).addSeries){
                var data = () => this.data.iterator();
                (<ISeriesRadiusScaleSystem><any>sc).addSeries(data);
                lastCancel.cancel();
                lastCancel = {
                    cancel: () => {
                        (<ISeriesRadiusScaleSystem><any>sc).removeSeries(data);
                    }
                }
            }
            res.value = sc;
        });
        this.cancels.push(p);
        this.cancels.push(lastCancel);
        return res;
    }

    @create(() => new CartesianShapeData())
    shapeDataObject: CartesianShapeData

    get shapeData(){
        return this.shapeDataObject.shapeData;
    }

    get shapeDataProvider(){
        return this.shapeDataObject.shapeDataProvider
    }

    @create
    public r_findNearestDataMethod: variable.IVariable<(shape: CartesianSeries, r: IRectangle) => ISeriesFocusData[]>;

    get findNearestDataMetod(){
        return this.r_findNearestDataMethod.value;
    }

    set findNearestDataMetod(v){
        this.r_findNearestDataMethod.value = v;
    }

    create_r_findNearestDataMethod(){
        return findNearest(this, this.chart);
    }

    @inject
    chart: XYChart

    @create
    public r_origin: variable.IVariable<number>;

    get origin(){
        return this.r_origin.value;
    }

    set origin(v){
        this.r_origin.value = v;
    }

    create_r_origin(){
        return origin(this.chart, this.settings, this.globalSettings, this.r_yAxis, this);
    }

    @inject
    $container

    @create
    public r_findShapesForIndexVar: variable.IVariable<any>;

    get findShapesForIndexVar(){
        return this.r_findShapesForIndexVar.value;
    }

    set findShapesForIndexVar(v){
        this.r_findShapesForIndexVar.value = v;
    }

    create_r_findShapesForIndexVar(){
        var vari = variable(null).listener(v => {
            if (this.chart.type === "xy"){
                v.value = findShapesForIndexXY;
            }
            else{
                v.value = findShapesForIndex;
            }
        });
        this.cancels.push(vari.$r);
        return vari;
    }

    public findShapesForIndex(indx: number): ISeriesShape[]{
        return this.findShapesForIndexVar(this, indx);
    }

    /**
     * Highlight the given data
     * @param data
     * @param settings
     * @returns a cancellable that removes the highlighting
     */
    public createDataHighlighter(settings?: IDataHighlightSettings): IDataHighlighter{
        return this.highlighterVar(this, settings);
    }

    public findNearestData(r: IRectangle): ISeriesFocusData[]{
        return this.findNearestDataMetod(this, r);
    }

    @create
    public r_group: variable.IVariable<ISeriesGroup>;

    get group(){
        return this.r_group.value;
    }

    set group(v){
        this.r_group.value = v;
    }
    create_r_group(){
        var lastGroup: ISeriesGroup;
        var vari = variable<ISeriesGroup>(null).listener(v => {
            if (lastGroup){
                lastGroup.series.remove(lastGroup.series.values.indexOf(this));
            }
            lastGroup = null;
            if (this.settings.group || this.globalSettings.group){
                v.value = findOrCreateGroup(this.chart.series.groups.collection, this.settings.group || this.globalSettings.group);
                lastGroup = v.value;
                v.value.series.push(this);
            }
            else {
                v.value = null;
            }
        });
        return vari;
    }

    initDataLabels(){
        this.starter.add(() => {
            var last: ICancellable;
            var proc = procedure(() => {
                if (last){
                    last.cancel();
                    last = null;
                }
                if ("dataLabels" in this.settings) {
                    var dataLabels = this.settings.dataLabels;
                }
                else if ("dataLabels" in this.globalSettings) {
                    dataLabels = this.globalSettings.dataLabels;
                }
                if (dataLabels){
                    var dl: IDataLabelSettings;
                    if (typeof dataLabels === "boolean"){
                        dl = {

                        };
                    }
                    else {
                        dl = dataLabels;
                    }
                    var f = buildFactories(this.$container, join(SeriesDataLabelFactories, {
                        settings: dl
                    }));
                    last = (<any>f).dataLabels;
                }
            });
            return {
                cancel: () => {
                    proc.cancel();
                    if (last){
                        last.cancel();
                    }
                }
            }
        });
    }

    @create
    public r_area = variable<XYAreaSystem>(null);

    get area(){
        return this.r_area.value;
    }

    set area(v) {
        this.r_area.value = v;
    }
    create_r_area(){
        var lastXAxis: IXYAxis;
        var lastYAxis: IXYAxis;
        var lastViewport: ICancellable;
        var area = variable<XYAreaSystem>(null).listener(v => {
            var eqx = lastXAxis === this.xAxis;
            var eqy = lastYAxis === this.yAxis;
            if (lastXAxis){
                this.chart.viewports.remove(lastXAxis, lastYAxis);
            }
            lastXAxis = this.xAxis;
            lastYAxis = this.yAxis;
            var vp;
            vp = <XYAreaSystem>this.chart.viewports.add(lastXAxis, lastYAxis);
            v.value = vp;
            if (!eqx || !eqy){
                lastViewport = v.value.addSeries(this);
            }
        });
        this.cancels.push({
            cancel: () => {
                area.$r.cancel();
                this.chart.viewports.remove(lastXAxis, lastYAxis);
                lastViewport.cancel();
            }
        });
        return area;
    }


    @create
    domain: ReactiveSeriesMaxDomain;
    create_domain(){
        return domain(this.chart, this, this.r_data, this.r_xAxis, this.stack, this.r_origin);
    }

    @create
    public r_xAxis: variable.IVariable<IXYAxis>;

    get xAxis(){
        return this.r_xAxis.value;
    }

    set xAxis(v){
        this.r_xAxis.value = v;
    }

    create_r_xAxis(){
        var last: ICancellable = nullCancellable;
        var xAxis = variable<IXYAxis>(null).listener(v => {
            last.cancel();
            var xax = this.chart.xAxes;
            if (this.settings.xAxis){
                var ax =  xax.get(this.settings.xAxis);
                if (!ax){
                    ax = xax.primary;
                }
                v.value = ax;
            }
            else
            {
                v.value = xax.primary;
            }
            v.value.series.push(this);
            last = {
                cancel: () => {
                    v.value.series.remove(v.value.series.values.indexOf(this));
                }
            }
        });
        this.cancels.push({
            cancel: () => {
                xAxis.$r.cancel();
                last.cancel();
            }
        });
        return xAxis;
    }

    @create
    public r_yAxis: variable.IVariable<IXYAxis>;

    get yAxis(){
        return this.r_yAxis.value;
    }

    set yAxis(v){
        this.r_yAxis.value = v;
    }

    create_r_yAxis(){
        var last: ICancellable = nullCancellable;
        var yAxis = variable<IXYAxis>(null).listener(v => {
            last.cancel();
            var yax = this.chart.yAxes;
            if (this.settings.yAxis){
                var ax =  yax.get(this.settings.yAxis);
                if (!ax){
                    ax = yax.primary;
                }
                v.value = ax;
            }
            else
            {
                v.value = yax.primary;
            }
            v.value.series.push(this);
            last = {
                cancel: () => {
                    v.value.series.remove(v.value.series.values.indexOf(this));
                }
            }
        });
        this.cancels.push({
            cancel: () => {
                yAxis.$r.cancel();
                last.cancel();
            }
        });
        return yAxis;
    }

    @create
    public r_highlighterVar: variable.IVariable<any>;

    get highlighterVar(){
        return this.r_highlighterVar.value;
    }

    set highlighterVar(v){
        this.r_highlighterVar.value = v;
    }

    create_r_highlighterVar(){
        var vari = variable<any>(null).listener(v => {
            if (this.chart.type === "xy"){
                unobserved(() => {
                    v.value = xyHighlighter(<any>this, this.$container);
                });

            }
            else{
                switch(this.dataType){
                    case "point":
                        var hl = <(series: IXYSeriesSystem, settings?: IDataHighlightSettings) => IDataHighlighter>buildAndFetch(this.$container, PointHighlighterFactories, "factory");
                        break;
                    case "interval":
                        hl =  <(series: IXYSeriesSystem, settings?: IDataHighlightSettings) => IDataHighlighter>buildAndFetch(this.$container, IntervalHighlighterFactories, "factory");
                        break;
                    case "candle":
                        hl =  <(series: IXYSeriesSystem, settings?: IDataHighlightSettings) => IDataHighlighter>buildAndFetch(this.$container, CandleHighlighterFactories, "factory");
                        break;
                }
                v.value = hl;
            }
        });
        this.cancels.push(vari.$r);
        return vari;
    }

    @create
    public r_data: variable.IVariable<IReactiveRingBuffer<any>>;

    get data(){
        return this.r_data.value;
    }

    set data(v){
        this.r_data.value = v;
    }

    create_r_data(){
        var vari = variable<IReactiveRingBuffer<IXIndexedData>>(null).listener(v => {
            var buffer: IReactiveRingBuffer<IXIndexedData> = null;
            var data = this.settings.data || this.globalSettings.data;
            if (data){
                switch(this.chart.type){
                    case "x":
                        switch(this.dataType){
                            case "point":
                                unobserved(() => {
                                    buffer = createValueData(data);
                                });
                                break;
                            case "candle":
                                unobserved(() => {
                                    buffer = createCandleData(data);
                                });
                                break;
                            case "interval":
                                unobserved(() => {
                                    buffer = createIntervalData(data);
                                });
                                break;
                        }
                        break;
                    case "xy":
                        unobserved(() => {
                            buffer = xyData(data);
                        });
                        break;
                }
            }
            if (buffer && unobserved(() => buffer.length > 0)){
                v.value = buffer;
            }
            else{
                if (this.globalData && this.globalData.data){
                    var d = this.globalData.data;
                    var buff = new ReactiveXSortedRingBuffer();
                    d.forEach(d => {
                        buff.push(d);
                    });
                    v.value = buff;

                }
                else{
                    v.value = new ReactiveXSortedRingBuffer();
                }
            }
        });
        this.cancels.push(vari.$r);
        return vari;
    }

    public get dataType(){
        return this.settings.dataType || this.globalSettings.dataType || "point";
    }

    get summarizedData(){
        return this.data;
    }

    public getDataBoundingBox(data: IXIntervalData): IRectangle{
        var x = this.getXBoundingInterval(data);
        var y = this.getYBoundingInterval(data);
        return {x: x.start, width: x.size, y: y.start, height: y.size};
    }

    @create
    createRenderer(){
        if (this.chart.type == "xy"){
            return new XYPointSeriesRenderer();
        }
        else{
            switch(this.dataType){
                case "point":
                    return new ValueGroupSeriesRenderer();
                case "interval":
                    return new IntervalGroupSeriesRenderer();
                case "candle":
                    return new CandleGroupSeriesRenderer();
            }

        }
    }

    @create
    public r_renderer: variable.IVariable<GroupSeriesRenderer>;

    get renderer(){
        return this.r_renderer.value;
    }

    set renderer(v){
        this.r_renderer.value = v;
    }

    create_r_renderer(){
        var last: ICancellable = null;
        var vari = variable(null).listener(v => {
            this.stack.present;
            last && last.cancel();
            v.value = this.createRenderer();
            last = v.value;
        });
        this.cancels.push({
            cancel: () => {
                vari.cancel();
                if (last){
                    last.cancel();
                }
            }
        });
        return vari;
    }


    @init
    init(){
        this.initDataLabels();
        this.starter.add(() => {
            this.renderer
            return nullCancellable
        })
    }

}

export interface ICartesianSeriesShapeSettings extends ISeriesRendererSettings{
    type: "point" | "column" | "line" | "area" | "candle" | "discrete";
}

export type SeriesShapeSettings = "point" | "column" | "line" | "area" | "candle" | "discrete" | ICartesianSeriesShapeSettings;

export interface ICartesianDataSettings{
    type: "array" | "csv";
}

export interface IDiscreteIntervalSettings{
    size?: number;
}

export interface IXDiscreteIntervalSettings extends IDiscreteIntervalSettings{
    /**
     * For discrete x-axes, provides the stack id when this is a stackable series.
     * Series that have the same stack id will be stacked on top of each other.
     * Only works for series with @{ICartesianSeriesSettings.dataType} "point"
     */
    stack?: string;
    placement?: "share" | "single" | "stack";
}

export interface IDataTransitionSettings extends IEasingSettings{

}

/**
 * Settings for a cartesian series
 * @editor
 */
export interface ICartesianSeriesSettings extends ISeriesSettings{
    /**
     * The data this series will visualize. The type of the data depends on the @api{dataType} setting.
     */
    data?: any;

    dataTransition?: IDataTransitionSettings;

    /**
     * If this option is specified, the chart will render labels for the data in a series.
     */
    dataLabels?: IDataLabelSettings | boolean;
    
    /**
     * The id of the x-axis to use. If not specified, the primary axis will be used
     */
    xAxis?: string;
    /**
     * The id of the y-axis to use. If not specified, the primary axis will be used
     */
    yAxis?: string;
    /**
     * The id of the group this series belongs to. If the group does not exist, it will be created.
     */
    group?: string;
    /**
     * The data type this series is visualizing. 
     * 
     * 
     * * point: data with property "y", representing a point
     * * interval: data with properties "ys" and "ye", representing an interval
     * * candle: data with properties "open", "high", "low" and "close", representing a candlestick
     * 
     * Note that the legal types also depend on the @api{ICartesianChartSettings.type} setting. A chart
     * with a @api{ICartesianChartSettings.type} setting "xy" can only visualize data of type "point", whereas
     * charts of type "x" can visualize all data types.
     * 
     */
    dataType?: CartesianDataTypes;
    /**
     * The shape or shapes to use to visualize the data. Defaults to "point"
     */
    shape?: SeriesShapeSettings | SeriesShapeSettings[];
    /**
     * The id of the radius scale to use.
     */
    radiusScale?: string;
    /**
     * The id of the color scale to use.
     */
    colorScale?: string;
    
    xBucket?: IXDiscreteIntervalSettings;
    yBucket?: IDiscreteIntervalSettings;
}

export interface IXYSeriesSystem extends ICartesianSeries{

    findNearestData(rect: IRectangle): ISeriesFocusData[];
    findShapesForIndex(indx: number): ISeriesShape[];
    shapeData: IReactiveRingBuffer<IShapeDataHolder<IXIndexedData>>;
    shapeDataProvider: IShapeDataProvider;
    
    /**
     * Highlight the given data
     * @param data
     * @param settings
     * @returns a cancellable that removes the highlighting
     */
    createDataHighlighter(settings?: IDataHighlightSettings): IDataHighlighter;
    starter: MultiStarter;
    cancels: ICancellable[];
    cancel(): void;

}

