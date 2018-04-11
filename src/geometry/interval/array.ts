/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IInterval} from "./index";
import {IIterable, IIterator} from "../../collection/iterator";

export class IntervalArrayWrapper{

    constructor(public intervals: IInterval[]){

    }

    minDistance(){
        var intervals = this.intervals;
        var dist = 9999999999;
        if (intervals.length > 1) {

            var last = intervals[0];
        }
        if (intervals.length < 2) {
            return 0;
        }
        for(var i=1; i < intervals.length; i++) {
            var c = intervals[i];
            dist = Math.min(dist, Math.abs(last.start + last.size - c.start));
            last = c;
        }
        return dist;
    }
}

export default function array(intervals: IInterval[]){
    return new IntervalArrayWrapper(intervals);
}

export function spanningFromCollection(it: IIterator<IInterval>): IInterval{
    if (it.hasNext()){
        var start = Number.MAX_VALUE;
        var end = -Number.MAX_VALUE;
        while(it.hasNext()){
            var s = it.next();
            start = Math.min(start, s.start);
            end = Math.max(end, s.start + s.size);
        }
        return {
            start: start,
            size: end - start
        }
    }
    return {
        start:0,
        size: 10
    }
}