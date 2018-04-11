/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../../../geometry/interval/index";
import {ICandlestick} from "../../../../datatypes/candlestick";
import {createMaximizedSortedDomainCalculator} from "./data";
import {getEndX} from "../../../../datatypes/range";

function getMinMax(value: ICandlestick): {min: number, max: number, xs: number, xe: number}{
    return {
        min: value.low,
        max: value.high,
        xs: value.x,
        xe: getEndX(value)
    }
}

export interface IHorizontalValueMaxDomainSettings{
    xDomain?: () => IPointInterval;
}

export function createHorizontalCandlestickDomainCalculator(settings: IHorizontalValueMaxDomainSettings){
    return createMaximizedSortedDomainCalculator({
        getMinMax: getMinMax,
        xWindow: settings.xDomain
    });
}