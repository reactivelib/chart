/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "./index";
import {IColorable} from "../../../../datatypes/color";


export default function(pt: IColorable & IShapeDataHolder<IColorable>){
    pt.c = pt.data.c;
}