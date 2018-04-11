/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IYIntervalData} from "../../../../../datatypes/range";
import {IShapeDataHolder} from "../index";
import {ICartesianXPoint} from "../../../../../datatypes/value";

export interface IVerticalDataRangeShapeDataHolder<E extends IYIntervalData> extends IShapeDataHolder<E>, IYIntervalData{

}

export default function(pt: ICartesianXPoint & IYIntervalData & IShapeDataHolder<ICartesianXPoint & IYIntervalData>){
    pt.y = pt.data.y;
    if ("ye" in pt.data){
        pt.ye = pt.data.ye;
    }
}