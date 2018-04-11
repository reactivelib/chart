/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ITransformation} from "../../../../../../math/transform/matrix";
import {IPointWithRadius} from "../index";

export default function(p: IPointWithRadius, transform: ITransformation){
    var np = transform.transform(p.x, p.y);
    p.x = np.x;
    p.y = np.y;
    return p;
}