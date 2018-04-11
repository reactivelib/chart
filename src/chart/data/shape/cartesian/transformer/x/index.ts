/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IXIndexedData} from "../../../../../../datatypes/range";
import {IShapeDataHolder} from "../../../transform/index";

export interface IXIndexedShapeDataHolder<E extends IXIndexedData> extends IShapeDataHolder<E>, IXIndexedData{
    
}