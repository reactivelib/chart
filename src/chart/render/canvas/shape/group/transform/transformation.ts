import {CanvasContext} from "../../../context/index";
import {AffineMatrix, ITransformation, TransformationWithMatrix} from "../../../../../../math/transform/matrix";
import {ICanvasChildShape} from "../../index";
import {optional} from "@reactivelib/core";

export interface IShapeWithTransformation extends ICanvasChildShape{
    mapper: ITransformation;
}

export function beforeTransform(mapper: ITransformation, ctx: CanvasContext){
    var inv = mapper.copy().inverse();
    if (!inv.present){
        return inv;
    }
    var old = ctx.transform.copy();
    ctx.transform = new TransformationWithMatrix(<AffineMatrix>ctx.transform, mapper);    
    var p1 = inv.value.transform(ctx.x, ctx.y);
    var p2 = inv.value.transform(ctx.x + ctx.width, ctx.y + ctx.height);
    var xs = Math.min(p1.x, p2.x);
    var xe = Math.max(p1.x, p2.x);
    var ys = Math.min(p1.y, p2.y);
    var ye = Math.max(p1.y, p2.y);
    ctx.x = xs;    
    ctx.y = ys;
    ctx.width = xe - xs;
    ctx.height = ye - ys;
    return optional(old);
}

export function afterTransform(mapper: ITransformation, ctx: CanvasContext){
    if (mapper){
        ctx.transform = mapper;
    }
}