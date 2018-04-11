/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IOptional} from "@reactivelib/core";
import {IPointInterval} from "../../../../geometry/interval/index";
import { optional } from "@reactivelib/reactive";
import { IIterator } from "../../../../collection/iterator";

export interface ISeriesMaxDomain{
    x: IOptional<IPointInterval>;
    y: IOptional<IPointInterval>;
}

export interface ISeriesMaxDomain{
    x: IOptional<IPointInterval>;
    y: IOptional<IPointInterval>;
}

export class ReactiveSeriesMaxDomain{
    public x = optional<IPointInterval>();
    public y = optional<IPointInterval>();
}


export function seriesMaxDomainsToX(domains: IIterator<ISeriesMaxDomain>): IPointInterval{
    var xs = Number.MAX_VALUE;
    var xe = -Number.MAX_VALUE;
    while(domains.hasNext()){
        var d = domains.next();
        if (d.x.present){
            var x = d.x.value;
            xs = Math.min(xs, x.start);
            xe = Math.max(xe, x.end);
        }
    }
    if (xs === Number.MAX_VALUE){
        xs = 1;
        xe = 10;
    }
    return {
       start: xs, end: xe
    }
}

export function seriesMaxDomainsToY(domains: IIterator<ISeriesMaxDomain>): IPointInterval{
    var ys = Number.MAX_VALUE;
    var ye = -Number.MAX_VALUE;
    while(domains.hasNext()){
        var d = domains.next();
        if (d.y.present){
            var y = d.y.value;
            ys = Math.min(ys, y.start);
            ye = Math.max(ye, y.end);
        }
    }
    if (ys === Number.MAX_VALUE){
        ys = 1;
        ye = 10;
    }
    else if (ys === ye){
        ys -= 1;
        ye += 1;
    }
    return {
        start: ys, end: ye
    }
}