/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "../../transform";
import {SimpleDataTransformer} from "../transformer/x/update";
import {IDiscreteContext} from "../../../../cartesian/series/render/position";
import {IOptional} from "@reactivelib/core";
import trX from '../../transform/point/x';
import trXCartesian from '../../transform/cartesian/discrete/x';
import {ICartesianXInterval} from "../../../../../datatypes/interval";

function join(f1: (a) => void, f2: (a) => void){
    return function(a){
        f1(a);
        f2(a);
    }
}

export function createValueDataTransformer(yCategory: IOptional<IDiscreteContext>, xCategory: IOptional<IDiscreteContext>){
    var modify: (pt: ICartesianXInterval & IShapeDataHolder<ICartesianXInterval>) => void = function(pt){
        pt.y = pt.data.y;
        pt.ye = pt.data.ye;
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
    return new SimpleDataTransformer((x: ICartesianXInterval) => {
        var res = new Data(x);
        modify(res);
        return res;
    });
}