import {ICandleWithMiddle} from "../index";
import {CanvasContext} from "../../../context/index";
import {popStyle, pushStyle} from "../../../style/index";

export function drawCandle(stroke: number, ctx: CanvasContext, candle: ICandleWithMiddle){
    var ct = ctx.context;
    var left = candle.x;
    var right = candle.xe;
    if (right - left > 4){
        right -= 1;
        left += 1;
    }
    left = (left);
    right = (right);
    var close = candle.close;
    var open = candle.open;
    var high = candle.high;
    var low = candle.low;
    var middle = (candle.middle);
    var o = (Math.min(open, close));
    var c = (Math.max(open, close));
    var h = (Math.max(high, low));
    var l = (Math.min(high, low));
    ct.moveTo(left, c);
    ct.lineTo(middle - stroke, c);
    ct.lineTo(middle-stroke, h);
    ct.lineTo(middle+stroke, h);
    ct.lineTo(middle+stroke, c);
    ct.lineTo(right, c);
    ct.lineTo(right, o);
    ct.lineTo(middle+stroke, o);
    ct.lineTo(middle+stroke, l);
    ct.lineTo(middle-stroke, l);
    ct.lineTo(middle-stroke, o);
    ct.lineTo(left, o);
    ct.lineTo(left, c);
    ct.closePath();
}

export default function(candle: ICandleWithMiddle, ctx: CanvasContext){
    var last = candle;
    var old = pushStyle(ctx.context, {
        strokeStyle: "rgb(255, 255, 255)",
        lineWidth: 1
    });
    if (last.open < last.close){
        var xsign = 1;
    }
    else {
        xsign = -1;
    }
    if (last.low < last.high){
        var ysign = 1;
    }
    else {
        ysign = -1;
    }
    if (last.x < last.xe){
        var lsign = 1;
    }
    else {
        var lsign = -1;
    }
    var add = 0.5;
    last.x = (last.x - add*lsign);
    last.xe = (last.xe + add*lsign);
    last.open = (last.open - add*xsign);
    last.close = (last.close + add*xsign);
    last.low = (last.low - add*ysign);
    last.high = (last.high + add*ysign);
    drawCandle(1.5, ctx, last);
    ctx.context.stroke();
    ctx.context.beginPath();
    var add = 2;
    last.x = (last.x - add*lsign);
    last.xe = (last.xe + add*lsign);
    last.open = (last.open - add*xsign);
    last.close = (last.close + add*xsign);
    last.low = (last.low - add*ysign);
    last.high = (last.high + add*ysign);
    popStyle(ctx.context, old);
    old = pushStyle(ctx.context, {
        strokeStyle: <any>ctx.context.strokeStyle,
        lineWidth: 2
    });
    drawCandle(3, ctx, last);
    ctx.context.stroke();
    ctx.context.beginPath();
    popStyle(ctx.context, old);

}