/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {getEndY, IYIntervalData} from "../../../../../../datatypes/range";
import {IShapeDataHolder} from "../../index";
import {getShapeInterval, IDiscreteContext} from "../../../../../cartesian/series/render/position/index";

export interface IDiscreteYShapeDataHolder<E extends IYIntervalData> extends IShapeDataHolder<E>, IYIntervalData{
    yDiscreteContext: IDiscreteContext;
}

export default function(pt: IYIntervalData & IDiscreteYShapeDataHolder<IYIntervalData>){
    var data = pt.data;
    var ivl = getShapeInterval(data.y, getEndY(data), pt.yDiscreteContext);
    pt.y = ivl.xs;
    pt.ye = ivl.xe;
}