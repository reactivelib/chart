/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IAxis, ITickAxis} from "./axis";
import {map1d} from "../../transform/index";
import {IIterable} from "../../../collection/iterator/index";

function syncLinear(first: IAxis, toSync: IAxis){
    var firstMax = first.domain;
    var firstDomain = first.window;
    var domain = toSync.domain;
    var mapper = map1d(firstMax).to(domain).create();
    var y = mapper(firstDomain.start);
    var ey = mapper(firstDomain.end);
    toSync.window.start = y;
    toSync.window.end = ey;
}

export function syncLinearDomains(first: IAxis, toSync: IIterable<IAxis>){
    var it = toSync.iterator();
    while(it.hasNext()){
        syncLinear(first, it.next());
    }
}

function syncLinearMarker(first: ITickAxis, toSync: ITickAxis){
    var firstMax = first.tickDomain;
    var firstDomain = first.window;
    var domain = toSync.tickDomain;
    var mapper = map1d(firstMax).to(domain).create();
    var y = mapper(firstDomain.start);
    var ey = mapper(firstDomain.end);
    toSync.window.start = y;
    toSync.window.end = ey;
}

export function syncLinearMarkerDomains(first: ITickAxis, toSync: IIterable<ITickAxis>){
    var it = toSync.iterator();
    while(it.hasNext()){
        syncLinearMarker(first, it.next());
    }
}