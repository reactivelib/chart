/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "../index";
import {IPoint} from "../../../../../geometry/point/index";
import {IValueSettings} from "../../../../../animation/ease/index";
import {Constructor} from "@reactivelib/core";
import {ICartesianXPoint} from "../../../../../datatypes/value";

export default function(pt: ICartesianXPoint & IShapeDataHolder<ICartesianXPoint>){
    pt.y = pt.data.y;
}