import {IPointRectangle} from "../../../../../../geometry/rectangle/index";
import {CanvasContext} from "../../../context/index";
import {popStyle, pushStyle} from "../../../style/index";

export function drawRectangleWithWhiteStroke(last: IPointRectangle, ctx: CanvasContext, drawRectangle: (ctx: CanvasContext, rect: IPointRectangle) => void){
    var old = pushStyle(ctx.context, {
        strokeStyle: "rgb(255, 255, 255)",
        lineWidth: 2
    });
    var xs = last.xs - 1;
    var xe = last.xe + 1;
    var ys = last.ys - 1;
    var ye = last.ye + 1;
    drawRectangle(ctx, last);
    ctx.context.stroke();
    ctx.context.beginPath();
    xs -= 2;
    xe += 2;
    ys -= 2;
    ye += 2;
    popStyle(ctx.context, old);
    old = pushStyle(ctx.context, {
        strokeStyle: <any>ctx.context.fillStyle,
        lineWidth: 2
    });
    drawRectangle(ctx, {xs: xs, xe: xe, ys: ys, ye: ye});
    ctx.context.stroke();
    ctx.context.beginPath();
    popStyle(ctx.context, old);
}