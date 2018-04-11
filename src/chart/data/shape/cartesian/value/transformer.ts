/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianXPoint} from "../../../../../datatypes/value";
import {IShapeDataHolder} from "../../transform";
import {SimpleDataTransformer} from "../transformer/x/update";
import {IDiscreteContext} from "../../../../cartesian/series/render/position";
import {IOptional} from "@reactivelib/core";
import trX from '../../transform/point/x';
import trY from '../../transform/point/y';
import trXCartesian from '../../transform/cartesian/discrete/x';
import trYCartesian from '../../transform/cartesian/discrete/y';

function join(f1: (a) => void, f2: (a) => void){
    return function(a){
        f1(a);
        f2(a);
    }
}

function createValueDataTransformer(xCategory: IOptional<IDiscreteContext>, yCategory: IOptional<IDiscreteContext>){
    var modify: (pt: ICartesianXPoint & IShapeDataHolder<ICartesianXPoint>) => void;
    function Data(data){
        this.data = data;
    }
    if (xCategory.present){
        Data.prototype.xDiscreteContext = xCategory.value;
        modify = <any>trXCartesian;
    }
    else
    {
        modify = trX;
    }
    if (yCategory.present){
        Data.prototype.yDiscreteContext = yCategory.value;
        modify = join(modify, trYCartesian);
    }
    else
    {
        modify = join(modify, trY);
    }
    return new SimpleDataTransformer((x: ICartesianXPoint) => {
        var res = new Data(x);
        modify(res);
        return res;
    });
}

export default function(yCategory: IOptional<IDiscreteContext>, xCategory: IOptional<IDiscreteContext>){
    return () => {
        if (xCategory.present){
            var x = xCategory.value;
            x.shared;
            x.stack;
            x.nr;
            x.position;
            x.size;
        }
        if (yCategory.present){
            var y = yCategory.value;
            y.shared;
            y.stack;
            y.nr;
            y.position;
            y.size;
        }
        return createValueDataTransformer(xCategory, yCategory);
    }
}