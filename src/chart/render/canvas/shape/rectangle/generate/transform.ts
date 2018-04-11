/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {mapPointRectangle} from "../../../../../../math/transform/geometry";
import {IPointRectangle} from "../../../../../../geometry/rectangle/index";
import {ITransformation} from "../../../../../../math/transform/matrix";

export function transformRectangle(r: IPointRectangle, transform: ITransformation){
    return mapPointRectangle(r, transform);
}