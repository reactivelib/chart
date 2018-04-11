/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "../index";
import {IIntervalData} from "../../../../../datatypes/interval";

export default function(pt: IIntervalData & IShapeDataHolder<IIntervalData>){
    var data = pt.data;
    pt.y = data.y;
    pt.ye = data.ye;
}