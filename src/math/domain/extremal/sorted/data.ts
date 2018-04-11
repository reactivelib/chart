/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../../../geometry/interval/index";
import {IPointRectangle} from "../../../../geometry/rectangle/index";
import {IIterator} from "../../../../collection/iterator/index";
import {IXIntervalData} from "../../../../datatypes/range";
import {IOptional, optional} from "@reactivelib/core";
import {IXSortedRingBuffer} from "../../../../collection/array/ring";

export interface IMaximizedSortedDomainCalcSettings{

    xWindow?: () => IPointInterval;
    getMinMax: (value: any) => {min: number, max: number, xs: number, xe: number};

}

function getXDomainIterator(summary: IXSortedRingBuffer<IXIntervalData>, domain: IPointInterval){
    var fsi = summary.firstSmaller(domain.start, false);
    if (fsi > -1){
        var s = summary.get(fsi).x;
    }
    else {
        s = domain.start;
    }
    var fbi = summary.firstBigger(domain.end, false);
    if (fbi < summary.length){
        var e = summary.get(fbi).x;
    }
    else {
        e = domain.end;
    }
    return summary.intervalIterator(s, true, e, true);
}

function getDataIterator(summary: IXSortedRingBuffer<IXIntervalData>){
    return summary.iterator();
}

export interface IMaximizedSortedDomainCalculator{
    
    dataIterator(): IIterator<IXIntervalData>;
    getMinMax(value: IXIntervalData): {min: number, max: number, xs: number, xe: number};
    
}

export function createMaximizedSortedDomainCalculator(this: void, settings: IMaximizedSortedDomainCalcSettings){
    var res: (data: IXSortedRingBuffer<IXIntervalData>) => IOptional<IPointRectangle>;
    var iter: (d: IXSortedRingBuffer<IXIntervalData>) => IIterator<any>;
    if (settings.xWindow){
        iter = function(d){
            var dom = settings.xWindow();
            return getXDomainIterator(d, dom);
        }
    }
    else {
        iter = getDataIterator;
    }
    res = function(summary){
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        var it = iter(summary);
        if (!it.hasNext()){
            return optional<IPointRectangle>();
        }
        while(it.hasNext()){
            var v = it.next();
            var mm = settings.getMinMax(v);
            min = Math.min(min, mm.min);
            max = Math.max(max, mm.max);
        }
        var sm = summary.get(0).x;
        var fsm = summary.firstSmaller(sm, false);
        if (fsm === -1){
            fsm = sm;
        }
        else {
            fsm = summary.get(fsm).x;
        }
        var xs = settings.getMinMax(summary.findOne(fsm)).xs;
        var b = summary.get(summary.length - 1).x;
        var fb = summary.firstBigger(b, false);
        if (fb === summary.length){
            fb = b;
        }
        else {
            fb = summary.get(fb).x;
        }
        var xe = settings.getMinMax(summary.findOne(fb)).xe;
        return optional({xs: xs, xe: xe, ys: min, ye: max});
    }
    return function(summary: IXSortedRingBuffer<IXIntervalData>){
        if (summary.length === 0){
            return optional<IPointRectangle>();
        }
        return res(summary);
    }
}