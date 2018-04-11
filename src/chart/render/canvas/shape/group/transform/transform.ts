import {CanvasContext} from "../../../context/index";
import {AffineMatrix} from "../../../../../../math/transform/matrix";
import {IPoint} from "../../../../../../geometry/point/index";
import {Constructor} from "@reactivelib/core";
import {ICanvasChildShape} from "../../index";
/*
export type type = IMappingGroup;

function beforeTransform(shape: IMappingGroup, ctx: CanvasContext){
    if (!shape.mapper){
        return true;
    }
    (<any>shape)._oldMapper = ctx.transform.copy();
    (<AffineMatrix>ctx.transform).compose(<AffineMatrix>shape.mapper);
    var inv = shape.mapper.copy().inverse();
    if (!inv.present){
        ctx.transform = (<any>shape)._oldMapper;
        (<any>shape)._oldMapper = null;
        return false;
    }
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
    return true;
}

function afterTransform(shape: IMappingGroup, ctx: CanvasContext){
    if (!shape.mapper){
        return;
    }
    ctx.transform = (<any>shape)._oldMapper;
    (<any>shape)._oldMapper = null;
}

export function draw(draw: type['draw']): type['draw']{
    return function(this: type, ctx: CanvasContext){
        var t  = beforeTransform(this, ctx);
        if (!t){
            return;
        }
        draw.call(this, ctx);
        afterTransform(this, ctx);
    }
}

export function find(find: type['find']): type['find']{
    return function(this: type, pt: IPoint, ctx: CanvasContext){
        var t = beforeTransform(this, ctx);
        if (!t){
            return;
        }
        var r = find.call(this, pt, ctx);
        afterTransform(this, ctx);
        return r;
    }
}

*/