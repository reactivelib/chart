/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../../context/index";
import {array} from "@reactivelib/reactive";
import {ICanvasConfig} from "../create";
import {IIterator} from "../../../../../collection/iterator/index";
import {IInteraction} from "../../interaction/index";
import {IPoint} from "../../../../../geometry/point/index";

// export class PolygonBoundingBox extends BoundingBox{
//
//     private r_x = rvar(0);
//     private r_y = rvar(0);
//     private r_width = rvar(2);
//     private r_height = rvar(2);
//     public procedure: Procedure;
//
//     get height(){
//         if (this.recalculate){
//             this.updateProcedure = true;
//             this.procedure.update();
//         }
//         return this.r_height.value;
//     }
//
//     set height(v: number){
//         this.r_height.value = v;
//     }
//
//     get width(){
//         if (this.recalculate){
//             this.updateProcedure = true;
//             this.procedure.update();
//         }
//         return this.r_width.value;
//     }
//
//     set width(v: number){
//         this.r_width.value = v;
//     }
//
//     get y(){
//         if (this.recalculate){
//             this.updateProcedure = true;
//             this.procedure.update();
//         }
//         return this.r_y.value;
//     }
//
//     set y(v: number){
//         this.r_y.value = v;
//     }
//
//     get x(){
//         if (this.recalculate){
//             this.updateProcedure = true;
//             this.procedure.update();
//         }
//         return this.r_x.value;
//     }
//
//     set x(v: number){
//         this.r_x.value = v;
//     }
//
//     public recalculate = false;
//     public updateProcedure = true;
//
//     constructor(public node: PolygonRenderer){
//         super();
//         this.procedure = procedure(() => {
//             if (this.updateProcedure){
//                 var points = node.getPoints();
//                 var sx = Number.MAX_VALUE;
//                 var ex = -Number.MAX_VALUE;
//                 var sy = Number.MAX_VALUE;
//                 var ey = -Number.MAX_VALUE;
//                 if (!points.hasNext()){
//                     return;
//                 }
//                 while(points.hasNext()){
//                     var p = points.next();
//                     sx = Math.min(sx, p.x);
//                     ex = Math.max(ex, p.x);
//                     sy = Math.min(sy, p.y);
//                     ey = Math.max(ey, p.y);
//                 }
//                 this.x = sx;
//                 this.y = sy;
//                 this.width = ex- sx;
//                 this.height = ey - sy;
//                 this.recalculate = false;
//             }
//             else {
//                 this.recalculate = true;
//             }
//             this.updateProcedure = false;
//
//         });
//     }
//
//     public interacts(pt: IPoint, screenPadding, context){
//         var int = super.interacts(pt, screenPadding, context);
//         if (int){
//             var pad = 0;
//             if (screenPadding){
//                 pad = Math.max(screenPadding.left || 0, screenPadding.top || 0, screenPadding.left || 0, screenPadding.bottom || 0);
//             }
//             var intersection = context.interaction.interaction.intersection;
//             var m = context.transform;
//             var pts = iterator(this.node.getPoints()).toArray().map(p => m.transform(p.x, p.y));
//             if (intersection !== "line"){
//                 int =  pointIsInPoly(pt, pts);
//                 if (int) {
//                     return true;
//                 }
//             }
//             var pt1 = pts[0];
//             for (var i=1; i < pts.length; i++){
//                 var pt2 = pts[i];
//                 var xyDist = pointXYDistance(pt, pt1, pt2);
//                 if(xyDist - pad <= 3){
//                     return true;
//                 }
//                 pt1 = pt2;
//             }
//         }
//         return false;
//     }
//
// }

function dista(arr: number[], i: number, j: number) {
    return Math.sqrt(Math.pow(arr[2*i]-arr[2*j], 2) + Math.pow(arr[2*i+1]-arr[2*j+1], 2));
}

function va(arr: number[], i: number, j: number){
    return [arr[2*j]-arr[2*i], arr[2*j+1]-arr[2*i+1]]
}

function ctlpts(x1: number,y1: number,x2: number,y2: number,x3: number,y3: number,t: number) {
    var v = va(<any>arguments, 0, 2);
    var d01 = dista(<any>arguments, 0, 1);
    var d12 = dista(<any>arguments, 1, 2);
    var d012 = d01 + d12;
    return [x2 - v[0] * t * d01 / d012, y2 - v[1] * t * d01 / d012,
        x2 + v[0] * t * d12 / d012, y2 + v[1] * t * d12 / d012 ];
}

function drawSplines(ctx: CanvasRenderingContext2D, pts: number[], t: number) {
    var cps: number[] = [];
    for (var i = 0; i < pts.length - 2; i += 1) {
        cps = cps.concat(ctlpts(pts[2*i], pts[2*i+1], pts[2*i+2], pts[2*i+3], pts[2*i+4], pts[2*i+5], t));
    }
    drawCurvedPath(ctx, cps, pts);

}

function drawCurvedPath(ctx: CanvasRenderingContext2D, cps: number[], pts: number[]){

    var len = pts.length / 2; // number of points
    if (len < 2) return;
    if (len == 2) {
        ctx.moveTo(pts[0], pts[1]);
        ctx.lineTo(pts[2], pts[3]);
    }
    else {

        ctx.moveTo(pts[0], pts[1]);
        // from point 0 to point 1 is a quadratic
        ctx.quadraticCurveTo(cps[0], cps[1], pts[2], pts[3]);
        // for all middle points, connect with bezier
        for (var i = 2; i < len-1; i += 1) {
            ctx.bezierCurveTo(cps[(2*(i-1)-1)*2], cps[(2*(i-1)-1)*2+1],
                cps[(2*(i-1))*2], cps[(2*(i-1))*2+1],
                pts[i*2], pts[i*2+1]);
        }
        ctx.quadraticCurveTo(cps[(2*(i-1)-1)*2], cps[(2*(i-1)-1)*2+1],
            pts[i*2], pts[i*2+1]);

    }

}


export class SplinePolygonMixin{

    public getPoints: () => IIterator<IPoint>;

    public drawShape(ctx: CanvasContext){
        var it = this.getPoints();
        var points = [];
        while(it.hasNext()){
            var p = it.next();
            p = ctx.transform.transform(p.x, p.y);
            points.push(p.x);
            points.push(p.y);
        }
        drawSplines(ctx.context, points, 0.5);
    }

}

export interface IPolygonConfig extends ICanvasConfig{

    points: IPoint[];

}

export function drawPolygon(ctx: CanvasContext, points: IIterator<IPoint>){
    if (points.hasNext()){
        var last = points.next();
        last = ctx.transform.transform(last.x, last.y);
        ctx.context.moveTo((last.x), (last.y));
        while(points.hasNext())
        {
            var pt = points.next();
            pt = ctx.transform.transform(pt.x, pt.y);
            ctx.context.lineTo((pt.x), (pt.y));
        }
    }
}

export function strokePolygonRounded(ctx: CanvasContext, points: IIterator<IPoint>){
    if (points.hasNext()){
        var last = points.next();
        last = ctx.transform.transform(last.x, last.y);
        ctx.context.moveTo(Math.round(last.x- 0.5)+0.5, Math.round(last.y - 0.5)+0.5);
        while(points.hasNext())
        {
            var pt = points.next();
            pt = ctx.transform.transform(pt.x, pt.y);
            ctx.context.lineTo(Math.round(pt.x - 0.5)+0.5, Math.round(pt.y - 0.5)+0.5);
        }
    }
}

export function fillPolygonRounded(ctx: CanvasContext, points: IIterator<IPoint>){
    if (points.hasNext()){
        var last = points.next();
        last = ctx.transform.transform(last.x, last.y);
        ctx.context.moveTo(Math.round(last.x), Math.round(last.y));
        while(points.hasNext())
        {
            var pt = points.next();
            pt = ctx.transform.transform(pt.x, pt.y);
            ctx.context.lineTo(Math.round(pt.x), Math.round(pt.y));
        }
    }
}

export interface IPolygonInteraction extends IInteraction{
    intersection?: string;
}