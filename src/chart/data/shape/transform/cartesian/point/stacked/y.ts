/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianPointDataHolder} from "../index";
import {Constructor} from "@reactivelib/core";
import {ICanvasChildShape, ICanvasShape} from "../../../../../../render/canvas/shape/index";

export interface IYPosDataProviderShape extends ICanvasChildShape{
    
    getPosY(data: ICartesianPointDataHolder): number;
    
}

export function getPosY(data: ICartesianPointDataHolder){
    return data.ye;
}

export default function<E extends Constructor<ICanvasShape>>(c: E): E {
    c.prototype.getPosY = getPosY;
    return c;
}