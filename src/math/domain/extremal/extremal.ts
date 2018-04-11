/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {extend} from "@reactivelib/core";
import {resizeIntervalByOrigin} from "../../../geometry/interval/resize";
import {IPointInterval} from "../../../geometry/interval/index";

export interface IDomainAddition{
    min: number;
    max: number;
}

export interface IDomainAdditionSettings{
    min?: number;
    max?: number;
}

export function normalizeDomainAdditionSettings(settings: number | IDomainAdditionSettings): IDomainAddition{
    if (!settings){
        return {
           min: 0, max: 0
        }
    }
    if (typeof settings === "number"){
        var s = <number> settings;
        return {
            min: s, max:s
        }
    }
    return extend({min: 0, max: 0}, settings);
}

export function addToDomain(settings: IDomainAddition, domain: IPointInterval){
    var s = domain.start;
    var e = domain.end;
    s += settings.min;
    e += settings.max;
    return {
        start: s, end: e
    }
}

function extendByOrigin(ivl: IPointInterval, origin: number): IPointInterval{
    var ivl = resizeIntervalByOrigin(ivl, origin);
    return {
        start: ivl.start, end: ivl.end
    }
}