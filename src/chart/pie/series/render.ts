/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {PieSeries} from "./index";
import {nullCancellable, variable} from "@reactivelib/reactive";
import {IReactiveRingBuffer} from "../../reactive/collection/ring";
import {IValuePoint} from "../../../datatypes/value";
import {ICanvasChildShape} from "../../render/canvas/shape/index";
import {CanvasContext} from "../../render/canvas/context/index";
import {IFindInfo} from "../../render/canvas/find/index";
import {getAngleInRadian, IPieChartSettings} from "../factory";
import {donutInteracts, drawDoughnut, IDonut} from "../../render/canvas/shape/doughnut/index";
import {normalizeRad} from "../../../math/transform/polar";
import {IPoint} from "../../../geometry/point";
import {PieChart} from "..";
import {IRectangle} from "../../../geometry/rectangle";
import {HTMLAxisCenter} from "../../../component/layout/axis/center";
import {IColor} from "../../../color";
import {deps} from "../../../config/di";

function drawLine(shape: IDonut, ctx: CanvasContext, sliceDist: number){
    var cx = shape.x;
    var cy = shape.y;
    var sr = Math.max(0, shape.startRadius);
    var er = Math.max(sr, shape.endRadius);
    var pt = ctx.transform.transform(cx, cy);
    cx = Math.round(pt.x);
    cy = Math.round(pt.y);
    var startAngle = normalizeRad(shape.startAngle);
    var endAngle = normalizeRad(shape.endAngle);
    
    var sRadius = Math.max(0, sr);
    var eRadius = Math.max(0, er);

    var x1 = cx + sRadius*Math.cos(startAngle);
    var y1 = cy + sRadius*Math.sin(startAngle);

    var x2 = cx + eRadius*Math.cos(startAngle);
    var y2 = cy + eRadius*Math.sin(startAngle);

    var x3 = cx + eRadius*Math.cos(endAngle);
    var y3 = cy + eRadius*Math.sin(endAngle);

    var x4 = cx + sRadius*Math.cos(endAngle);
    var y4 = cy + sRadius*Math.sin(endAngle);
    ctx.context.moveTo(x1, y1);
    ctx.context.lineTo(x2, y2);
    ctx.context.moveTo(x3, y3);
    ctx.context.lineTo(x4, y4);
    ctx.context.strokeStyle = "white";
    ctx.context.lineWidth = sliceDist;
    ctx.context.stroke();
    ctx.context.beginPath();
}

function drawLineStart(shape: IDonut, ctx: CanvasContext, sliceDist: number){
    var cx = shape.x;
    var cy = shape.y;
    var sr = Math.max(0, shape.startRadius);
    var er = Math.max(sr, shape.endRadius);
    var pt = ctx.transform.transform(cx, cy);
    cx = Math.round(pt.x);
    cy = Math.round(pt.y);
    var startAngle = normalizeRad(shape.startAngle);
    var endAngle = normalizeRad(shape.endAngle);
    
    var sRadius = Math.max(0, sr);
    var eRadius = Math.max(0, er);
    var x1 = cx + sRadius*Math.cos(startAngle);
    var y1 = cy + sRadius*Math.sin(startAngle);
    var x2 = cx + eRadius*Math.cos(startAngle);
    var y2 = cy + eRadius*Math.sin(startAngle);
    ctx.context.moveTo(x1, y1);
    ctx.context.lineTo(x2, y2);
    ctx.context.strokeStyle = "white";
    ctx.context.lineWidth = sliceDist;
    ctx.context.stroke();
    ctx.context.beginPath();
}

function drawLineEnd(shape: IDonut, ctx: CanvasContext, sliceDist: number){
    var cx = shape.x;
    var cy = shape.y;
    var sr = Math.max(0, shape.startRadius);
    var er = Math.max(sr, shape.endRadius);
    var pt = ctx.transform.transform(cx, cy);
    cx = Math.round(pt.x);
    cy = Math.round(pt.y);
    var startAngle = normalizeRad(shape.startAngle);
    var endAngle = normalizeRad(shape.endAngle);
    
    var sRadius = Math.max(0, sr);
    var eRadius = Math.max(0, er);
    var x3 = cx + eRadius*Math.cos(endAngle);
    var y3 = cy + eRadius*Math.sin(endAngle);
    var x4 = cx + sRadius*Math.cos(endAngle);
    var y4 = cy + sRadius*Math.sin(endAngle);
    ctx.context.moveTo(x3, y3);
    ctx.context.lineTo(x4, y4);
    ctx.context.strokeStyle = "white";
    ctx.context.lineWidth = sliceDist;
    ctx.context.stroke();
    ctx.context.beginPath();
}

export interface IFoundSlice extends ICanvasChildShape{
    series: PieSeries;
    index: number;
    data: IValuePoint;
}

export interface IRenderedPieDonut extends IDonut{

    color: string;
    bb: IRectangle;

}

class PieSeriesShape{

    public tag: "custom" = "custom";
    public lastFound: IFoundSlice;
    public node: ICanvasChildShape;

    constructor(public series: PieSeries, public chartSettings: IPieChartSettings, public center: HTMLAxisCenter, public colorProvider: () => () => string, public chart: PieChart){

    }

    public color: IColor;
    public style: any;

    public highlight(){
        return nullCancellable;
    }


    public draw(ctx: CanvasContext){
        var chartSettings = this.chartSettings;
        var cont = ctx.context;
        var lastFill = cont.fillStyle;      
        var lastStroke = cont.strokeStyle;
        var shapes = this.series.renderedShapes;
        if ("sliceDistance" in chartSettings){
            var sliceDist = chartSettings.sliceDistance;
        }
        else{
            sliceDist = 2;
        }
        var sangle = normalizeRad(getAngleInRadian(chartSettings.startAngle, chartSettings.angleUnit) || 0);
        var eangle = normalizeRad(getAngleInRadian(chartSettings.endAngle, chartSettings.angleUnit) || 2*Math.PI);
        var chart = this.chart;
        var sliceEndStart = sangle === eangle;
        for (var i=0; i < shapes.length; i++){
            var shape = shapes[i];
            var col = shape.color;
            cont.fillStyle = col;
            var bb = drawDoughnut(ctx, shape);        
            shape.bb = bb;
            ctx.context.fill();
            ctx.context.beginPath();
            if (sliceDist > 0){
                if (!sliceEndStart){
                    if (i == 0){
                        drawLineEnd(shape, ctx, sliceDist);
                    }
                    else if (i === shapes.length - 1){
                        drawLineStart(shape, ctx, sliceDist);                        
                    }
                    else{
                        drawLine(shape, ctx, sliceDist);
                    }                    
                }else{
                    drawLine(shape, ctx, sliceDist);
                }         
            }
        }
        cont.fillStyle = lastFill;
        cont.strokeStyle = lastStroke;
    }

    public findShapesByIndex(indx: number){
        return [];
    }

    public cancel(){

    }

    public find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        var sr = this.series.startRadius;
        var er = this.series.endRadius;
        var sangle = normalizeRad(getAngleInRadian(this.chartSettings.startAngle, this.chartSettings.angleUnit) || 0);
        var eangle = normalizeRad(getAngleInRadian(this.chartSettings.endAngle, this.chartSettings.angleUnit) || 2*Math.PI);
        if (sangle === eangle){
            eangle += 2*Math.PI;
        }
        if (sangle > eangle){
            eangle += 2*Math.PI;
        }
        var cx = this.chart.centerX;
        var cy = this.chart.centerY;
        var data = this.series.data;
        var l = data.length;
        var valueSum = 0;
        for (var i=0; i < l; i++){
            var d = data.get(i);
            valueSum += d.y;
        }
        var angleDiff = eangle - sangle;        
        for (var i=0; i < l; i++){
            var d = data.get(i);     
            var ea = sangle + (d.y / valueSum) * angleDiff;
            var shape = {
                x: cx,
                y: cy,
                startRadius: sr,
                endRadius: er,
                startAngle: sangle,
                endAngle: ea
            };
            if (donutInteracts(shape, pt, ctx)){
                if (this.lastFound){
                    if (this.lastFound.data === d && this.lastFound.index === i){
                        return [{
                            shape: this.lastFound
                        }]
                    }
                }
                this.lastFound = {
                    parent: this.node.parent,
                    series: this.series,
                    data: d,
                    index: i
                };
                return [{shape: this.lastFound}];
            }
            sangle = ea;
        }
        this.lastFound = null;
        return null;
    }

}

export default function(series: PieSeries, data: variable.IVariable<IReactiveRingBuffer<IValuePoint>>, chartSettings: IPieChartSettings, center: HTMLAxisCenter, colorProvider: any, chart: PieChart){
    var shape = new PieSeriesShape(series, chartSettings, center, colorProvider, chart);
    return shape;
}