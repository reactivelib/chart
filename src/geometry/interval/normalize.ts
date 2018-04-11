/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator} from "../../collection/iterator/index";
import {IInterval} from "./index";

export function removeNegativeStart(intervals: IIterator<IInterval>){
    var sx = Number.MAX_VALUE;
    var ivls: IInterval[] = [];
    while (intervals.hasNext())
    {
        var ivl = intervals.next();
        sx = Math.min(sx, ivl.start);
        ivls.push(ivl);
    }
    if (sx < 0)
    {
        for (var i=0; i < ivls.length; i++)
        {
            var ch = ivls[i];
            ch.start -= sx;
        }
    }
}