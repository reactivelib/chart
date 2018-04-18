/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "../../transform";
import {SimpleDataTransformer} from "../transformer/x/update";
import {IDiscreteContext} from "../../../../cartesian/series/render/position";
import {IOptional} from "@reactivelib/core";
import trX from '../../transform/point/x';
import trXCartesian from '../../transform/cartesian/discrete/x';
import {ICandlestick} from "../../../../../datatypes/candlestick";

function join(f1: (a) => void, f2: (a) => void){
    return function(a){
        f1(a);
        f2(a);
    }
}

export function createValueDataTransformer(yCategory: IOptional<IDiscreteContext>, xCategory: IOptional<IDiscreteContext>){
    var modify: (pt: ICandlestick & IShapeDataHolder<ICandlestick>) => void = function(pt){
        pt.open = pt.data.open;
        pt.high = pt.data.high;
        pt.low = pt.data.low;
        pt.close = pt.data.close;
    };
    function Data(data){
        this.data = data;
    }
    if (xCategory.present){
        Data.prototype.xDiscreteContext = xCategory.value;
        modify = join(modify, trXCartesian);
    }
    else
    {
        modify = join(modify, trX);
    }
    return new SimpleDataTransformer((x: ICandlestick) => {
        var res = new Data(x);
        modify(res);
        return res;
    });
}

export default function(yCategory: IOptional<IDiscreteContext>, xCategory: IOptional<IDiscreteContext>){
    return () => {
        return createValueDataTransformer(yCategory, xCategory);
    }
}