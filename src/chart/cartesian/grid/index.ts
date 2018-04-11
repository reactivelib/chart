/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../../render/canvas/shape/index";
import {CanvasContext} from "../../render/canvas/context/index";
import {IFlexibleTickAxis} from "../../../math/domain/axis/axis";
import {ITransformation} from "../../../math/transform/matrix";
import {IPoint} from "../../../geometry/point/index";
import {crispLine} from "../../render/canvas/shape/line/index";
import {create, define, init, inject} from "../../../config/di";
import {IAxisCollection} from "../axis/collection/index";
import {ICartesianViewport} from "../area/index";
import {ICartesianChartSettings, XYChart} from "../index";
import {ICanvasStyle, IStylable} from "../../render/canvas/style/index";
import {IGlobalChartSettings} from "../../style";
import {extend} from "@reactivelib/core";
import {IIterator} from "../../../collection/iterator/index";
import {IGridIntervalSettings,} from "../../render/canvas/layout/axis/positions";
import {variable} from "@reactivelib/reactive";
import {drawByStyle} from "../../render/canvas/style/apply";

type IVariable<E> = variable.IVariable<E>;

/**
 * Settings for the marker lines inside a chart
 */
export interface ITickLineSettings{
    /**
     * The style of the lines
     */
    style?: ICanvasStyle;
    position?: "exact" | "between";
    overflow?: number | IGridIntervalSettings;
    
}

export interface IGridRenderer extends ICanvasChildShape, IStylable{
    positionAxis: IVariable<IFlexibleTickAxis>;
    lengthAxis: IVariable<IFlexibleTickAxis>;
    mapper: (pos: number, length: number, matrix: ITransformation) => IPoint;
    viewport: IVariable<ICartesianViewport>;
    getTickPositions(): IIterator<number>;
}

export class GridRenderer{

    public shape: ICanvasStyle;
    public style: ICanvasStyle;
    public node: IStylable;
    public tag = "custom";

    constructor(public positionAxis: IVariable<IFlexibleTickAxis>, public lengthAxis: IVariable<IFlexibleTickAxis>, 
        public mapper: (pos: number, length: number, matrix: ITransformation, res: IPoint) => void,
        public viewport: IVariable<ICartesianViewport>){
        
    }

    public getTickPositions(){
        var s = this.positionAxis.value.window.start;
        var e = this.positionAxis.value.window.end;
        var markers = this.positionAxis.value.ticks;
        var n = markers.next(s);
        n = markers.previous(n);
        if (n < s){
            n = markers.next(n);
        }
        return {
            hasNext: function(){
                return n < e;
            },
            next: function(){
                var s = n;
                n = markers.next(n);
                return s;
            }
        }
    }

    public onAttached(){
        this.node.style = this.style;
    }

    public draw(ctx: CanvasContext){
        drawByStyle(<IStylable>this.node, ctx, () => {
            var nr = 0;
            var it = this.getTickPositions();
            var tr = this.viewport.value.mapper;
            var sl = this.lengthAxis.value.window.start;
            var el = this.lengthAxis.value.window.end;
            var p1 = {x: 0, y: 0};
            var p2 = {x: 0, y: 0};
            while(it.hasNext()){
                var n = it.next();
                this.mapper(n, sl, tr, p1);
                this.mapper(n, el, tr, p2);
                crispLine(p1, p2);
                ctx.context.moveTo(p1.x, p1.y);
                ctx.context.lineTo(p2.x, p2.y);
                nr++;
                if (nr > 100){
                    break;
                }
            }
        });        
    }

}

function getBetweenTickPositions(this: IGridRenderer): IIterator<number>{
    var s = this.positionAxis.value.window.start;
    var e = this.positionAxis.value.window.end;
    var markers = this.positionAxis.value.ticks;
    var n = markers.next(s);
    n = markers.previous(n);
    if (n < s){
        n = markers.next(n);
    }
    n = markers.previous(n);
    e = markers.next(e);
    var nnext = markers.next(n);
    return {
        hasNext: function(){
            return nnext < e;
        },
        next: function(){
            var s = (n + nnext) / 2;
            n = nnext;
            nnext = markers.next(nnext);
            return s;
        }
    }
}

function xPosMapper(pos: number, length: number, mapper: ITransformation, res: IPoint){
    mapper.transformRef(pos, length, res);
}

function yPosMapper(pos: number, length: number, mapper: ITransformation, res: IPoint){
    mapper.transformRef(length, pos, res);
}

function overflowSettings(s: number | IGridIntervalSettings): IGridIntervalSettings{
    if(typeof s === "number"){
        return {
            start: s,
            end: s
        }
    }
    else {
        return extend({start:0 , end: 0}, s);
    }
}

export class XGridLineRenderer{

    @define
    mapper = xPosMapper

    @inject
    chart: XYChart

    @inject
    chartSettings: ICartesianChartSettings

    @inject
    theme: IGlobalChartSettings

    @create(function(this: XGridLineRenderer){
        var settings = this.chartSettings
        if ("xTickLines" in settings && !settings.xTickLines){
            return null;
        }
        if (!this.theme.xTickLines){
            return null;
        }
        var sets = createTickLineSettings(settings.xTickLines, this.theme.xTickLines);
        return sets;
    })
    settings: ITickLineSettings

    @inject
    r_yAxes: IVariable<IAxisCollection>

    @inject
    r_xAxes: IVariable<IAxisCollection>

    @inject
    primaryViewport: IVariable<ICartesianViewport>

    get positionAxis(){
        return this.r_xAxes.value.primary
    }

    get lengthAxis(){
        return this.r_yAxes.value.primary
    }

    @create(function(this: XGridLineRenderer){
        var self = this
        if (!this.settings){
            return null;
        }
        var r = new GridRenderer({
            get value(){
                return self.positionAxis
            }
        }, {
            get value(){
                return self.lengthAxis
            }
        }, this.mapper, this.primaryViewport);

        if (this.settings.position === "between") {
            r.getTickPositions = getBetweenTickPositions;
        }
        r.style = this.settings.style || (this.theme.xTickLines && (<ITickLineSettings>this.theme.xTickLines).style) || {};
        this.chart.center.getLayer(0).getCanvas().child.insert(0, r);
        return r;
    })
    gridRenderer: GridRenderer

    @init
    init(){
        this.gridRenderer
    }

}

function createTickLineSettings(tickLines: ITickLineSettings | boolean, axisTheme: ITickLineSettings | boolean): ITickLineSettings{
    return extend({}, axisTheme, tickLines);
}


export class YGridLineRenderer{

    @define
    mapper = yPosMapper

    @inject
    chart: XYChart

    @inject
    chartSettings: ICartesianChartSettings

    @inject
    theme: IGlobalChartSettings

    @create(function(this: XGridLineRenderer){
        var settings = this.chartSettings
        if ("yTickLines" in settings && !settings.yTickLines){
            return null;
        }
        if (!this.theme.yTickLines){
            return null;
        }
        var sets = createTickLineSettings(settings.yTickLines, this.theme.yTickLines || {});
        return sets;
    })
    settings: ITickLineSettings

    @inject
    r_xAxes: IVariable<IAxisCollection>

    @inject
    r_yAxes: IVariable<IAxisCollection>

    @inject
    primaryViewport: IVariable<ICartesianViewport>

    get positionAxis(){
        return this.r_yAxes.value.primary
    }

    get lengthAxis(){
        return this.r_xAxes.value.primary
    }

    @create(function(this: XGridLineRenderer){
        var self = this
        if (!this.settings){
            return null;
        }
        var r = new GridRenderer({
            get value(){
                return self.positionAxis
            }
        }, {
            get value(){
                return self.lengthAxis
            }
        }, this.mapper, this.primaryViewport);
        if (this.settings.position === "between"){
            r.getTickPositions = getBetweenTickPositions;
        }
        r.style = this.settings.style || (this.theme.yTickLines && (<ITickLineSettings>this.theme.yTickLines).style) || {};
        this.chart.center.getLayer(0).getCanvas().child.insert(0, r);
        return r;
    })
    gridRenderer: GridRenderer

    @init
    init(){
        this.gridRenderer
    }

}