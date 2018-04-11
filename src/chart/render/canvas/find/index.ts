/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPaddingSettings, IRectangle} from "../../../../geometry/rectangle/index";
import {IPoint} from "../../../../geometry/point/index";
import {ICanvasChild, ICanvasChildShape} from "../shape/index";
import {IInteraction} from "../interaction/index";

export interface IFindInfo{
    shape: ICanvasChildShape;
    zIndex?: number;
    distance?: number;
}

export interface IBoundingBoxShape extends ICanvasChildShape{
    boundingBox: IRectangle;
}

export function testFindWithInteraction(pt: IPoint, bb: IRectangle, screenPadding: IPaddingSettings){
    var lx = bb.x;
    var rx = bb.x + bb.width;
    var by = bb.y;
    var ty = bb.y + bb.height;
    if (screenPadding){
        lx -= screenPadding.left || 0;
        rx += screenPadding.right || 0;
        by -= screenPadding.bottom || 0;
        ty += screenPadding.top || 0;
    }
    return (pt.x >= lx && pt.x <=rx && pt.y >= by && pt.y <= ty);
}


export function getComposedInteraction(shape: ICanvasChildShape): IInteraction{
    var int: any = {};
    if ((<ICanvasChild>shape).parent){
        int = getComposedInteraction((<ICanvasChild><any>shape).parent);
    }
    var ti = (<ICanvasChildShape>shape).interaction;
    if (ti){
        for (var p in ti){
            int[p] = (<any>ti)[p];
        }
    }
    return int;
}