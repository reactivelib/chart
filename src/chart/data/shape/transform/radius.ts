/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "./index";
import {IRadiusPoint} from "../../../../datatypes/radius";

export default function(pt: IRadiusPoint & IShapeDataHolder<IRadiusPoint>){
    pt.r = pt.data.r;
}