/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IRectangle} from "./index";
import {IIterator} from "../../collection/iterator";

export class RectangleArrayWrapper{
    constructor(public rectangles: IRectangle[]){

    }

    public spanning(){
        var rectangles = this.rectangles;
        var xS = 0;
        var xE = 0;
        var yS = 0;
        var yE = 0;
        if (rectangles.length > 0) {
            var r = rectangles[0];
            xS = r.x;
            yS = r.y;
            xE = xS + r.width;
            yE = yS + r.height;
        }
        for (var i=1; i < rectangles.length; i++){
            var r = rectangles[i];
            var x = r.x;
            var y = r.y;
            xS = Math.min(xS, x);
            yS = Math.min(yS, y);
            xE = Math.max(xE, x + r.width);
            yE = Math.max(yE, y + r.height);
        }
        return {
            x: xS,
            y: yS,
            width: xE - xS,
            height: yE - yS
        };
    }

}

export function spanningFromCollection(it: IIterator<IRectangle>): IRectangle{
    if (it.hasNext()){
        var xs = Number.MAX_VALUE;
        var xe = -Number.MAX_VALUE;
        var ys = Number.MAX_VALUE;
        var ye = -Number.MAX_VALUE;
        while(it.hasNext()){
            var s = it.next();
            xs = Math.min(xs, s.x);
            xe = Math.max(xe, s.x + s.width);
            ys = Math.min(ys, s.y);
            ye = Math.max(ye, s.y + s.height);
        }
        return {
            x: xs,
            y: ys,
            width: xe - xs,
            height: ye - ys
        }
    }
    return {
        x: 0,
        y: 0,
        width: 10,
        height: 10
    }
}

export default function array(rect: IRectangle[]) {
    return new RectangleArrayWrapper(rect);
}