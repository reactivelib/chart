/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../../../geometry/interval/index";
import {IIntervalData} from "../../../../datatypes/interval";
import {createMaximizedSortedDomainCalculator} from "./data";
import {IPointRectangle} from "../../../../geometry/rectangle/index";
import {getEndX, IXIntervalData} from "../../../../datatypes/range";
import {IOptional} from "@reactivelib/core";
import {IXSortedRingBuffer} from "../../../../collection/array/ring";

function getMinMax(value: IIntervalData): {min: number, max: number, xs: number, xe: number}{
    return {
        min: value.y,
        max: value.ye,
        xs: value.x,
        xe: getEndX(value)
    }
}

export interface IHorizontalValueMaxDomainSettings{
    xDomain?: () => IPointInterval;
}

export function createHorizontalIntervalDomainCalculator(settings: IHorizontalValueMaxDomainSettings): (data: IXSortedRingBuffer<IXIntervalData>) => IOptional<IPointRectangle>{
    return createMaximizedSortedDomainCalculator({
        getMinMax: getMinMax,
        xWindow: settings.xDomain
    });
}