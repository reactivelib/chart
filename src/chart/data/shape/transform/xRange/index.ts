/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IXIndexedShapeDataHolder} from "../../cartesian/transformer/x/index";
import {getEndX, IXIndexedData, IXIntervalData} from "../../../../../datatypes/range";
import {IValueSettings} from "../../../../../animation/ease/index";
import {Constructor} from "@reactivelib/core";
import {ICartesianXPoint} from "../../../../../datatypes/value";
import {IShapeDataHolder} from "../index";

export interface IHorizontalDataRangeShapeDataHolder<E extends IXIntervalData> extends IXIndexedShapeDataHolder<E>, IXIntervalData{
    
}

export default function(pt: ICartesianXPoint & IShapeDataHolder<ICartesianXPoint>){
    pt.x = pt.data.x;
    if ("xe" in pt.data){
        pt.xe = pt.data.xe;
    }
}