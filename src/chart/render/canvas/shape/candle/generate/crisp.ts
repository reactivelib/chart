import {ICandleWithMiddle} from "../index";

export function makeCandleCrisp(candle: ICandleWithMiddle, round: (n: number) => number){
    var c: ICandleWithMiddle = candle;
    var left = round(c.x)
    var right = round(c.xe);
    var high = round(c.high)
    var low = round(c.low)
    var open = round(c.open)
    var close = round(c.close);
    return {
        x: left,
        xe: right,
        high: high,
        low: low,
        open: open,
        close: close,
        middle: round(c.middle)
    }
}

export default makeCandleCrisp;