/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "../index";
import {ICartesianXPoint} from "../../../../../datatypes/value";

export default function(pt: ICartesianXPoint & IShapeDataHolder<ICartesianXPoint>){
    pt.x = pt.data.x;
}