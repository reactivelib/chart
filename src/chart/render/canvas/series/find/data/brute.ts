/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPoint} from "../../../../../../geometry/point/index";
import {CanvasContext} from "../../../context/index";
import {HashMap} from "../../../../../../collection/hash";
import {IRectangle, pointRectangleDistance} from "../../../../../../geometry/rectangle/index";
import {IShapeWithData} from "../../data/index";
import {IFindInfo, testFindWithInteraction} from "../../../find/index";
import {IIterable} from "../../../../../../collection/iterator/index";

export class BruteForceSeriesShapeFinder<E>{
    
    public last = new HashMap<any, IShapeWithData<E>>();

    constructor(public shapes: IIterable<IShapeWithData<E>>,
                public getBoundingBox: (s: IShapeWithData<E>) => IRectangle){

    }

    public find(pt: IPoint, ctx: CanvasContext){
        var sp = ctx.interaction.interaction.screenPadding;
        var found = new HashMap<any, IShapeWithData<E>>();
        var ret: IFindInfo[] = [];
        var minDist = Number.MAX_VALUE;
        var it = this.shapes.iterator();
        while(it.hasNext()){
            var s = it.next();
            var bb = this.getBoundingBox(s);
            if (testFindWithInteraction(pt, bb, sp)){
                var res = this.last.get(s.data);
                if (!res){
                    res = s;
                }
                found.put(s.data, res);
                var dist = Math.round(pointRectangleDistance(pt, bb));
                if (dist < minDist){
                    minDist = dist;
                    ret = [{shape: <any>res, distance: dist}];
                }
                else if (dist === minDist){
                    ret.push({shape: <any>res, distance: dist});
                }
            }
        }
        this.last = found;
        return ret;
    }

}