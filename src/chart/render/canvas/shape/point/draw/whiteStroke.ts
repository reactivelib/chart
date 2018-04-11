import {IPointWithRadius} from "../index";
import {CanvasContext} from "../../../context/index";
import {popStyle, pushStyle} from "../../../style/index";

export default function drawPointWithWhiteStroke(last: IPointWithRadius, ctx: CanvasContext, drawPoint: (pt: IPointWithRadius, ctx: CanvasContext) => void){
    var old = pushStyle(ctx.context, {
        strokeStyle: "rgb(255, 255, 255)",
        lineWidth: 2
    });
    last.radius += 1;
    drawPoint(last, ctx);
    ctx.context.stroke();
    ctx.context.beginPath();
    last.radius += 2;
    popStyle(ctx.context, old);
    var s: any;
    s = ctx.context.fillStyle;
    old = pushStyle(ctx.context, {
        strokeStyle: s,
        lineWidth: 2
    });
    drawPoint(last, ctx);
    ctx.context.stroke();
    ctx.context.beginPath();
    popStyle(ctx.context, old);
}