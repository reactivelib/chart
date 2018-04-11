/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPoint} from "../../../../../geometry/point/index";

var headDrawer=function(ctx: CanvasRenderingContext2D,x0: number,y0:number,x1:number,y1:number,x2: number,y2: number)
{
    var radius=3;
    var twoPI=2*Math.PI;
    ctx.beginPath();
    ctx.arc(x0,y0,radius,0,twoPI,false);
    ctx.beginPath();
    ctx.arc(x1,y1,radius,0,twoPI,false);
    ctx.beginPath();
    ctx.arc(x2,y2,radius,0,twoPI,false);
    ctx.beginPath();
}

export class ArrowDrawer{
    
    public width: number;
    public arrowWidth: number;
    public arrowLength: number;
    
    public draw(ctx: CanvasRenderingContext2D, pt1: IPoint, pt2: IPoint){
        var fromx = pt1.x;
        var fromy = pt1.y;
        var tox = pt2.x;
        var toy = pt2.y;
        var headlen = 10;   // length of head in pixels
        var angle = Math.atan2(toy-fromy,tox-fromx);
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    }
    
}