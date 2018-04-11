/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../../index";
import {ITransformation} from "../../../../../../math/transform/matrix";
import {IRectangle} from "../../../../../../geometry/rectangle/index";
import dim from './dimension';
import {afterTransform, beforeTransform} from './transformation';
import {positionedAfter, positionedBefore} from './position';
import {restorePositionAfter, restorePositionBefore} from './restorePos';
import {clipAfter, clipBefore} from './clip';
import {CanvasContext} from "../../../context/index";

export interface ITransformingShape extends ICanvasChildShape{

    getTransform(): ITransformation;

}

export interface IFullTransformShape extends IRectangle{
    mapper: ITransformation;
}

export function draw(shape: IFullTransformShape, ctx: CanvasContext, draw: (ctx: CanvasContext) => void){
    var rect = restorePositionBefore(ctx);
    dim(shape, ctx);
    positionedBefore(shape,ctx);
    clipBefore(ctx);
    var tr = beforeTransform(shape.mapper, ctx);
    if (tr.present){
        draw(ctx);
        afterTransform(tr.value, ctx);
    }
    clipAfter(ctx);
    positionedAfter(shape, ctx);
    restorePositionAfter(rect, ctx);
}