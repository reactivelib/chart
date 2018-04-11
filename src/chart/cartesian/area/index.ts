/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array} from "@reactivelib/reactive";
import {ICartesianSeries, IXYSeriesSystem} from "../series/series";
import {IIdentifiable} from "../../../util/identification";
import {Domain, IWindow} from "../../../math/domain/base";
import {ICancellable} from "@reactivelib/reactive";
import {ICanvasChildShape} from "../../render/canvas/shape/index";
import {AffineMatrix, ITransformation} from "../../../math/transform/matrix";
import {createPointRectangleMapper, IValueMapperFactory, XYExchangedPointMapper} from "../../render/canvas/shape/group/transform/mapper";
import {IDimension} from "../../../geometry/rectangle/index";
import {IXYAxis} from "../axis/index";
import {variable} from "@reactivelib/reactive";
import {IValueTransformer, nullValueTransformer} from "../../../math/transform/interval";
import {IAxisCollection} from "../axis/collection/index";
import {ICanvasShapeOrConfig, renderCanvas} from "../../render/canvas/shape/create";
import {procedure} from "@reactivelib/reactive";
import {FlexibleChildGroupRenderer} from "../../render/canvas/shape/group/index";
import {SeriesCanvasGroup} from "./seriesCanvasGroup";
import {component, create, define, init, inject} from "../../../config/di";
import {unobserved} from "@reactivelib/reactive";
import {ChartCenter} from "../../core/center";
import {IndirectIntervalPointRectangle} from "../../../geometry/rectangle/pointRect";

/**
 * Represents the area were series of a cartesian chart are drawn into. Each area contains the x- and y-axes that 
 * determine how the data inside the series will be mapped.
 */
export interface ICartesianViewport extends IIdentifiable{

    /**
     * The x-axis 
     */
    xAxis: IXYAxis;
    /**
     * The y-axis
     */
    yAxis: IXYAxis;
    /**
     * The series using this viewport. 
     */
    series: array.IReactiveArray<ICartesianSeries>;
    /**
     * The tranformer mapping points from data-coordinates to screen-corrdinates. Transformation is determined
     * by the x- and y-Axis.
     */
    mapper: ITransformation;
    xMapper: IValueTransformer;
    yMapper: IValueTransformer;
    /**
     * The window mapped to this viewport.
     */
    window: IWindow;
}

export interface ICartesianViewportSystem extends ICartesianViewport{

    addSeries(series: IXYSeriesSystem): ICancellable;
    recalculate(): void;
    count: number;
    target: IDimension;
    cancels: ICancellable[];
    canvasGroup: FlexibleChildGroupRenderer;
    seriesCanvasGroup: SeriesCanvasGroup;

}

export interface IViewportSettings{

    xAxis?: string;
    yAxis?: string;
    shape?: ICanvasShapeOrConfig;

}

@component("viewport")
export class XYAreaSystem implements ICartesianViewportSystem{


    @define
    yAxis: IXYAxis;
    @define
    xAxis: IXYAxis;
    @create(function(this: XYAreaSystem){
        return new Domain(new IndirectIntervalPointRectangle(() => this.xAxis.window, () => this.yAxis.window));
    })
    window: IWindow;
    maxWindow: IWindow;
    series: array.IReactiveArray<ICartesianSeries> = array<ICartesianSeries>();
    @inject
    center: ChartCenter
    @create(function(this: XYAreaSystem){
        return this.center
    })
    public target: IDimension;
    public id: string;
    public count: number = 1;
    public cancels: ICancellable[] = [];
    private r_mapper = variable<ITransformation>(null);
    private r_xMapper = variable<IValueTransformer>(nullValueTransformer);
    private r_yMapper = variable<IValueTransformer>(nullValueTransformer);
    public shape: ICanvasChildShape;
    public r_settings = variable<IViewportSettings>(null);

    @create(() => new SeriesCanvasGroup())
    seriesCanvasGroup: SeriesCanvasGroup;

    @create(function(this: XYAreaSystem){
        var rend = new FlexibleChildGroupRenderer();
        var self = this;
        Object.defineProperty(rend, "mapper", {
            get: function(){
                return self.mapper;
            },
            configurable: true,
            enumerable: true
        });
        return rend;
    })
    public canvasGroup: FlexibleChildGroupRenderer;

    initShapes(){
        var lastShape: ICanvasChildShape = null;
        var proc = procedure(p => {
            if (lastShape){
                this.canvasGroup.removeChild(lastShape);
            }
            var sets = this.settings;
            if (sets){
                if (sets.shape){
                    unobserved(() => {
                        lastShape = renderCanvas(sets.shape);
                        this.canvasGroup.addChild(lastShape);
                    });
                }
            }
        });
        this.cancels.push({
            cancel: () => {
                proc.cancel();
                if (lastShape){
                    this.canvasGroup.removeChild(lastShape);
                }
            }
        });
        return proc;
    }

    @init
    public init(){
        this.initShapes();

    }

    get settings(){
        return this.r_settings.value;
    }
    set settings(v){
        this.r_settings.value = v;
    }
    
    get yMapper(){
        return this.r_yMapper.value;
    }
    
    set yMapper(v){
        this.r_yMapper.value = v;
    }
    
    get xMapper(){
        return this.r_xMapper.value;
    }
    
    set xMapper(v){
        this.r_xMapper.value = v;
    }
    
    get mapper(){
        return this.r_mapper.value;
    }
    
    set mapper(v: ITransformation){
        this.r_mapper.value = v;
    }
    
    public cancel(){
        this.cancels.forEach(c => c.cancel());
        this.cancels = [];
    }

    public recalculate(){
        var targ = {xs:0, ys:0, xe: this.target.width, ye: this.target.height};
        this.xMapper = this.xMapperFactory.value(this.xAxis.window, targ);
        this.yMapper = this.yMapperFactory.value(this.yAxis.window, targ);
        if (this.yOrigin === "left" || this.yOrigin === "right"){
            this.mapper = new XYExchangedPointMapper(this.xMapper, this.yMapper);
        }
        else
        {
            this.mapper = createPointRectangleMapper(this.xMapper, this.yMapper);
        }
    }

    constructor(public xMapperFactory: variable.IVariable<IValueMapperFactory>, public yMapperFactory: variable.IVariable<IValueMapperFactory>, public yAxes: variable.IVariable<IAxisCollection>){
        this.mapper = new AffineMatrix(1,0,0,0,1,0);
    }

    get yOrigin(){
        return this.yAxes.value.origin;
    }

    addSeries(series: IXYSeriesSystem){
        this.series.push(series);
        return {
            cancel: () => {
                this.series.remove(this.series.array.indexOf(series));
            }
        }
    }
    
};