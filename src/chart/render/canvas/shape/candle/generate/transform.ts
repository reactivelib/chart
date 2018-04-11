/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICandleWithMiddle} from "../index";
import { ITransformation } from "../../../../../../math/transform/matrix";

export function transformCandle(candle: ICandleWithMiddle, transform: ITransformation){
    var data = candle;
    var o = data.open;
    var c = data.close;
    var p1 = transform.transform(data.x, data.high);
    var pup = transform.transform(data.middle, c);
    var pdown = transform.transform(data.middle, o);
    var p2 = transform.transform(data.xe, data.low);
    return {
        x: p1.x,
        xe: p2.x,
        middle: pup.x,
        high: p1.y,
        low: p2.y,
        open: pdown.y,
        close: pup.y
    }
}

export default transformCandle;