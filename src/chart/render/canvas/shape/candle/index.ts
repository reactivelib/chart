/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICandlestick} from "../../../../../datatypes/candlestick";
import {IRectangle} from "../../../../../geometry/rectangle/index";
import {CanvasContext} from "../../context/index";

export interface ICandleWithMiddle extends ICandlestick{
    middle: number;
}

export interface ICandleGeneratingShape{
    _bb: IRectangle;
    generateCandle(ctx: CanvasContext): ICandleWithMiddle;
    drawCandle(ctx: CanvasContext, candle: ICandleWithMiddle): void;
}

export function getCandleBoundingBox(candle: ICandleWithMiddle, ctx: CanvasContext){
    var l = Math.min(candle.low, candle.high);
    var m = Math.max(candle.low, candle.high);
    return {
        x: candle.x,
        y: l,
        width: candle.xe - candle.x,
        height: m - l
    }
}

export function drawCandleWithMiddle(ctx: CanvasContext, candle: ICandleWithMiddle){
    var left = candle.x;
    var right = candle.xe;
    if (right - left > 4){
        right -= 1;
        left += 1;
    }
    var close = candle.close;
    var open = candle.open;
    var high = candle.high;
    var low = candle.low;
    var middle = candle.middle;
    var o = Math.min(open, close);
    var c = Math.max(open, close);
    var h = Math.max(high, low);
    var l = Math.min(high, low);
    ctx.context.rect(left, o, right - left, c - o);

    ctx.context.moveTo(middle, h);
    ctx.context.lineTo(middle, c);


    ctx.context.moveTo(middle, l);
    ctx.context.lineTo(middle, o);
}