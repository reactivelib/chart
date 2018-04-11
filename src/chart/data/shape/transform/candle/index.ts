/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "../index";
import {ICandlestick} from "../../../../../datatypes/candlestick";

export default function(pt: ICandlestick & IShapeDataHolder<ICandlestick>){
    pt.open = pt.data.open;
    pt.high = pt.data.high;
    pt.low = pt.data.low;
    pt.close = pt.data.close;
}