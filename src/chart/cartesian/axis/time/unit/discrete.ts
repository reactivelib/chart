import {ICategory, IDiscreteXYAxis} from "../../index";
import {nextSmallerUnit, timeSequence, TimeUnits} from "../../../../../math/sequence/time";

export default function(axis: IDiscreteXYAxis): TimeUnits{
    var domain = axis.domain;
    var sequence = axis.ticks;
    var cats = axis.categories;
    var sm = cats.get(0);
    if (!sm){
        var x = -Number.MAX_VALUE;
        return  "d";
    }
    else{
        x = sm.x;
    }
    var biggest = cats.get(cats.length - 1);
    if (!biggest){
        var bx = Number.MAX_VALUE;
    }
    else{
        bx = biggest.x;
    }
    var start = Math.max(domain.start, x);
    var end = Math.min(domain.end, bx);
    var it = sequence.iterator(start, end);
    var ed = 60*60*1000;
    var last: ICategory = null;
    var nr = 0;
    var diff = Number.MAX_VALUE;
    while(it.hasNext() && nr < 4){
        var next = cats.getByIndex(it.next());
        if (!next){
            continue;
        }
        if (last){
            diff = Math.min(diff, (<any>next).id - last.id);
            nr++;
        }
        last = next;
    }
    if (diff !== Number.MAX_VALUE){
        var p = timeSequence.previous(diff);
        var n = timeSequence.next(p);
        if (n <= diff){
            ed = n;
        }
        else
        {
            ed = p;
        }
    }
    return nextSmallerUnit(ed);
}