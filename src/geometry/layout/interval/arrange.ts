/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator} from "../../../collection/iterator/index";
import {IInterval} from "../../interval/index";

export interface IIntervalLeftToRightLayoutSettings{
    space: number;
    start: number;
    intervals: IIterator<IInterval>;
}


export function linearizeIntervals(settings: IIntervalLeftToRightLayoutSettings){
    var space = settings.space;
    var start = settings.start;
    var ivls = settings.intervals;
    while(ivls.hasNext()){
        var i = ivls.next();
        i.start = start;
        start += i.size+space;
    }
}