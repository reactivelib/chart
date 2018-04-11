import {CanvasContext} from "../../../context/index";

export function clipBefore(ctx: CanvasContext){
    ctx.context.save();
    var p1 = ctx.transform.transform(ctx.x, ctx.y);
    var p2 = ctx.transform.transform(ctx.x + ctx.width, ctx.y + ctx.height);
    var xs = Math.min(p1.x, p2.x);
    var xe = Math.max(p1.x, p2.x);
    var ys = Math.min(p1.y, p2.y);
    var ye = Math.max(p1.y, p2.y);
    ctx.context.rect(xs, ys, xe - xs, ye - ys);
    ctx.context.clip();
    ctx.context.beginPath();
    ctx.clips.push({x: xs, y: ys, width: xe - xs, height: ye - ys});
}

export function clipAfter(ctx: CanvasContext){
    ctx.context.restore();
    ctx.context.beginPath();
    ctx.clips.pop();
}

export default function(ctx: CanvasContext, draw: (ctx: CanvasContext) => void){
    clipBefore(ctx);
    draw(ctx);
    clipAfter(ctx);

}