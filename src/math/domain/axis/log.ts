import {ITickAxis} from "./axis";
import {IIterable} from "../../../collection/iterator/index";
import {IFlexibleDistanceTicks} from "../marker/base";

export function syncLogMarkerDomains(first: ITickAxis, toSync: IIterable<ITickAxis>){
    var it = toSync.iterator();
    var sd = first.domain.start;
    var ed = first.domain.end;
    while(it.hasNext()){
        var d = it.next();
        sd = Math.min(d.domain.start, sd);
        ed = Math.max(d.domain.end, ed);
        d.window.start = first.window.start;
        d.window.end = first.window.end;
        (<IFlexibleDistanceTicks>d.ticks).minDistance = (<IFlexibleDistanceTicks>first.ticks).minDistance;
        (<IFlexibleDistanceTicks>d.ticks).distance = (<IFlexibleDistanceTicks>first.ticks).distance;
    }
    sd = (<IFlexibleDistanceTicks>first.ticks).previous(sd);
    ed = (<IFlexibleDistanceTicks>first.ticks).next(ed);
    first.tickDomain.start = sd;
    first.tickDomain.end = ed;
    it = toSync.iterator();
    while(it.hasNext()){
        var d = it.next();
        d.tickDomain.start = sd;
        d.tickDomain.end = ed;
    }
}