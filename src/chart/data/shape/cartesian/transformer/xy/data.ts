/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICancellable} from "@reactivelib/reactive";
import {IReactiveRingBuffer, ReactiveXSortedRingBuffer} from "../../../../../reactive/collection/ring";
import {IPoint} from "../../../../../../geometry/point/index";
import {IXIndexedShapeDataHolder} from "../x/index";
import {IDataTransformer} from "../x/update";
import {ICartesianXPoint} from "../../../../../../datatypes/value";

export function createShapesDataCollection(transform: IDataTransformer, data: IReactiveRingBuffer<ICartesianXPoint>){
    var cancel: ICancellable = null;
    var sum = <ReactiveXSortedRingBuffer<IPoint>>data;
    var res = new ReactiveXSortedRingBuffer();
    var it = sum.iterator();
    while(it.hasNext()){
        var d = it.next();
        var s =  <IXIndexedShapeDataHolder<any>>transform.create(d);
        res.push(s);
    }
    cancel = sum.onUpdate({
        add: (pt, indx) => {
            var s =  <IXIndexedShapeDataHolder<any>>transform.create(pt);
            if (indx === 0){
                res.unshift(s);
            }
            else {
                res.push(s);
            }
        },
        remove: (pt, indx) => {
            if (indx === 0){
                res.shift();
            }
            else {
                res.pop();
            }
        },

        replace: (pt, indx, old) => {
            var holder = <IXIndexedShapeDataHolder<any>>res.get(indx);
            holder = <any>transform.update(pt, holder);
            res.set(indx, holder);
        }
    });
    return {
        data: res,
        cancel: () => {
            if (cancel){
                cancel.cancel();
            }
        }
    };    
}