import {IPointRectangle} from "../../../../../../geometry/rectangle/index";
import {CanvasContext} from "../../../context/index";

export interface IRoundSettings{
    tl: number;
    tr: number;
    br: number;
    bl: number;
}

export function drawRoundedRect(r: IPointRectangle, canvasCtx: CanvasContext, radius: IRoundSettings){
    var ctx = canvasCtx.context;
    var x = r.xs;
    var y = r.ys;
    var width = r.xe - r.xs;
    var height = r.ye - r.ys;
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}

export function getRoundRadius(radius: number | IRoundSettings){
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    }
    return radius;
}