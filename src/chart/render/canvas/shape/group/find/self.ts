import {IPoint} from "../../../../../../geometry/point/index";
import {CanvasContext} from "../../../context/index";
import {ICanvasChildShape} from "../../index";

export function findSelf(self: ICanvasChildShape, pt: IPoint, ctx: CanvasContext){
    var p1 = ctx.transform.transform(ctx.x, ctx.y);
    var p2 = ctx.transform.transform(ctx.x + ctx.width, ctx.y + ctx.height);
    var xs = Math.min(p1.x, p2.x);
    var xe = Math.max(p1.x, p2.x);
    var ys = Math.min(p1.y, p2.y);
    var ye = Math.max(p1.y, p2.y);
    if (pt.x >= xs && pt.x <= xe && pt.y >= ys && pt.y <= ye)
    {
        return [{shape: self, zIndex: -100}];
    }
    return [];
}