/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianXPoint} from "../../../../../../datatypes/value";
import {IYIntervalData} from "../../../../../../datatypes/range";
import {IXIndexedShapeDataHolder} from "../../../cartesian/transformer/x/index";

export interface ICartesianPointDataHolder extends IXIndexedShapeDataHolder<ICartesianXPoint>, ICartesianXPoint, IYIntervalData{
    data: ICartesianXPoint;
}