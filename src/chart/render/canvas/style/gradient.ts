/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../context/index";
import {ILine} from "../../../../geometry/line/index";
import {IRectangle} from "../../../../geometry/rectangle/index";

export interface IColorStop{
    color: string;
    stop: number;
}

export interface ILinearGradient{

    coordinates?: "shape" | "user";
    line: ILine;
    stops: IColorStop[];
}

function getGradientCoordinates(bb: IRectangle, line: ILine){
    var xs = bb.x;
    var ys = bb.y;
    var xe = bb.x + bb.width;
    var ye = bb.y + bb.height;
    xs = xs + (xe - xs) * line.start.x;
    ys = ys + (ye - ys) * line.start.y;
    xe = xs + (xe - xe) * line.end.x;
    ye = ys + (ye - ys) * line.end.y;
    return {
        start: {x: xs, y: ys}, end: {x: xe, y: ye}
    };
}


export function createLinearShapeGradient(ctx: CanvasContext, gradient: ILinearGradient, bb: IRectangle){
    var coords = getGradientCoordinates(bb, gradient.line);
    var c = ctx.context;
    var s = coords.start;
    var e = coords.end;
    var xs = s.x;
    var xe = e.x;
    var ys = s.y;
    var ye = e.y;
    if (Math.abs(xe - xs) < 1){
        xe = 0;
        xs = 0;
    }
    if (Math.abs(ye - ys) < 1){
        ys = 0;
        ye = 0;
    }
    var grad = c.createLinearGradient(Math.round(xs), Math.round(ys), Math.round(xe), Math.round(ye));
    gradient.stops.forEach(s => {
        grad.addColorStop(s.stop, s.color);
    });
    return grad;
}

export function createLinearUserGradient(ctx: CanvasContext, gradient: ILinearGradient){
    var c = ctx.context;
    var s = gradient.line.start;
    var e = gradient.line.end;
    s = ctx.transform.transform(s.x, s.y);
    e = ctx.transform.transform(e.x, e.y);
    var xs = s.x;
    var xe = e.x;
    var ys = s.y;
    var ye = e.y;
    if (Math.abs(xe - xs) < 1){
        xe = 0;
        xs = 0;
    }
    if (Math.abs(ye - ys) < 1){
        ys = 0;
        ye = 0;
    }
    var grad = c.createLinearGradient(Math.round(xs), Math.round(ys), Math.round(xe), Math.round(ye));
    gradient.stops.forEach(s => {
        grad.addColorStop(s.stop, s.color);
    });
    return grad;
}

export function fillShapeGradient(ctx: CanvasContext, bb: IRectangle){
    var gradient = <ILinearGradient>ctx.style.fillStyle;
    var c = ctx.context;
    var grad = createLinearShapeGradient(ctx, gradient, bb);
    var oldFill = c.fillStyle;
    c.fillStyle = grad;
    ctx.context.fill();
    c.fillStyle = oldFill;
}

export function strokeShapeGradient(ctx: CanvasContext, bb: IRectangle){
    var gradient = <ILinearGradient>ctx.style.fillStyle;
    var c = ctx.context;
    var grad = createLinearShapeGradient(ctx, gradient, bb);
    var oldFill = c.strokeStyle;
    c.strokeStyle = grad;
    ctx.context.stroke();
    c.strokeStyle = oldFill;
}