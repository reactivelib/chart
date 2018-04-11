import {CanvasContext} from "../../../context/index";
import {AffineMatrix} from "../../../../../../math/transform/matrix";
import {IPoint} from "../../../../../../geometry/point/index";
import {IFindInfo} from "../../../find/index";

export function positionedBefore(shape: IPoint, ctx: CanvasContext){
    if (shape.x || shape.y) {
        (<AffineMatrix>ctx.transform).translate(shape.x, 0);
        (<AffineMatrix>ctx.transform).translate(0, shape.y);
        ctx.y = 0;
        ctx.x = 0;
    }

}

export function positionedAfter(shape: IPoint, ctx: CanvasContext){
    if (shape.x || shape.y){
        (<AffineMatrix>ctx.transform).translate(-shape.x, 0);
        (<AffineMatrix>ctx.transform).translate(0, -shape.y);
    }
}

export function draw(shape: IPoint, ctx: CanvasContext, draw: (ctx: CanvasContext) => void){
    positionedBefore(shape, ctx);
    draw(ctx);
    positionedAfter(shape, ctx);
}

export function find(shape: IPoint, cursor: IPoint, ctx: CanvasContext, find: (cursor: IPoint, ctx: CanvasContext) => IFindInfo[]){
    positionedBefore(shape, ctx);
    var res = find(cursor, ctx);
    positionedAfter(shape, ctx);
    return res;
}