/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointRectangle} from "../../../../geometry/rectangle/index";
import {IIterable} from "../../../../collection/iterator/index";
import {IPoint} from "../../../../geometry/point/index";

export function calculateExtremal2d(data: IIterable<IPoint>): IPointRectangle{
    var it = data.iterator();
    if (!it.hasNext()){
        return {
            xs: 0, ys: 0, xe: 0, ye: 0
        }
    }
    var minx = Number.MAX_VALUE;
    var maxx = -Number.MAX_VALUE;
    var miny = Number.MAX_VALUE;
    var maxy = -Number.MAX_VALUE;
    while(it.hasNext()){
        var p = it.next();
        minx = Math.min(minx, p.x);
        maxx = Math.max(maxx, p.x);
        miny = Math.min(miny, p.y);
        maxy = Math.max(maxy, p.y);
    }
    return {
        xs: minx, ys: miny, xe: maxx, ye: maxy
    }
}