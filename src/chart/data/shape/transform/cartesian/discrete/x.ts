/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {getEndX, IXIntervalData} from "../../../../../../datatypes/range";
import {getShapeInterval, IDiscreteContext} from "../../../../../cartesian/series/render/position/index";
import {IXIndexedShapeDataHolder} from "../../../cartesian/transformer/x/index";

export interface IDiscreteXShapeDataHolder<E extends IXIntervalData> extends IXIndexedShapeDataHolder<E>, IXIntervalData{
    xDiscreteContext: IDiscreteContext;
}

export default function(pt: IXIntervalData & IDiscreteXShapeDataHolder<IXIntervalData>){
    var data = pt.data;
    var ivl = getShapeInterval(data.x, getEndX(data), pt.xDiscreteContext);
    pt.x = ivl.xs;
    pt.xe = ivl.xe;
}