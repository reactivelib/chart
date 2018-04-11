/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../../../geometry/interval/index";
import {IValueData} from "../../../../datatypes/value";
import {createMaximizedSortedDomainCalculator} from "./data";
import {IPointRectangle} from "../../../../geometry/rectangle/index";
import {getEndX, IXIndexedData} from "../../../../datatypes/range";
import {IOptional} from "@reactivelib/core";
import {IXSortedRingBuffer} from "../../../../collection/array/ring";

function getMinMax(value: IValueData): {min: number, max: number, xs: number, xe: number}{
    return {
        min: value.y,
        max: value.y,
        xs: value.x,
        xe: getEndX(value)
    }
}

export interface IHorizontalValueMaxDomainSettings{
    xDomain?: () => IPointInterval;
}

export function createHorizontalValueDomainDomain(settings: IHorizontalValueMaxDomainSettings): (data: IXSortedRingBuffer<IXIndexedData>) => IOptional<IPointRectangle>{
    return createMaximizedSortedDomainCalculator({
        xWindow: settings.xDomain,
        getMinMax: getMinMax
    });
}