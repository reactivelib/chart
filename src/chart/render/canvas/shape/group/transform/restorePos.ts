import {CanvasContext} from "../../../context/index";
import {ICanvasChildShape} from "../../index";
import {IPoint} from "../../../../../../geometry/point/index";
import {IRectangle} from "../../../../../../geometry/rectangle/index";

export type type = ICanvasChildShape;

export function restorePositionBefore(ctx: CanvasContext): IRectangle{
    return {
        x: ctx.x,
        y: ctx.y,
        width: ctx.width,
        height: ctx.height
    };
}

export function restorePositionAfter(rect: IRectangle, ctx: CanvasContext){
    ctx.x = rect.x;
    ctx.y = rect.y;
    ctx.width = rect.width;
    ctx.height = rect.height;
}

export function draw(ctx: CanvasContext, draw: (ctx: CanvasContext) => void){
    var last = restorePositionBefore(ctx);
    draw(ctx);
    restorePositionAfter(last, ctx);
}

export function find(pt: IPoint, ctx: CanvasContext, find: (pt: IPoint, ctx: CanvasContext) => void){
    var last = restorePositionBefore(ctx);
    var res = find(pt, ctx);
    restorePositionAfter(last, ctx);
    return res;
}