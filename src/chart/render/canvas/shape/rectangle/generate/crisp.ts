/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointRectangle} from "../../../../../../geometry/rectangle/index";

export function makeRectangleCrisp(r: IPointRectangle, round: (n:number) => number){
    r.xs = round(r.xs);
    r.ys = round(r.ys);
    r.xe = round(r.xe);
    r.ye = round(r.ye);
    return r;
}