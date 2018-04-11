/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointRectangle, IRectangle} from "../../geometry/rectangle/index";
import {ITransformation} from "./matrix";

export function mapRectangle(rect: IRectangle, mapper: ITransformation){
    var p1 = mapper.transform(rect.x, rect.y);
    var p2 = mapper.transform(rect.x + rect.width, rect.y + rect.height);
    return {
        x: Math.min(p1.x, p2.x),
        y: Math.min(p1.y, p2.y),
        width: Math.abs(p1.x - p2.x),
        height: Math.abs(p1.y - p2.y)
    }
}

export function mapPointRectangle(rect: IPointRectangle, mapper: ITransformation){
    var p1 = mapper.transform(rect.xs, rect.ys);
    var p2 = mapper.transform(rect.xe, rect.ye);
    return {
        xs: Math.min(p1.x, p2.x),
        ys: Math.min(p1.y, p2.y),
        xe: Math.max(p1.x, p2.x),
        ye: Math.max(p1.y, p2.y)
    }
}