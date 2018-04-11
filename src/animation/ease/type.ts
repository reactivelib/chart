import {IEaser} from "./func";
import {default as color, hsl as createHsl, Hsla, rgb as createRgb, Rgba} from "../../color/index";

export interface IValueEaserContext{

    start: any;
    end: any;
    value: any;
    duration: number;
    time: number;
    ease: IEaser;

}

export function easeAny(ctx: IValueEaserContext): any{
    return ctx.value;
}

export function easeNumber(ctx: IValueEaserContext): number{
    var start = ctx.start;
    var diff = ctx.end - start;
    return ctx.ease(ctx.time, start, diff, ctx.duration);
}

export function easeColor(ctx: IValueEaserContext): string{
    var start = ctx.start;
    var end = ctx.end;
    var time = ctx.time;
    var duration = ctx.duration;
    var res;
    if (start.space === "rgb") {
        var s = <Rgba> start;
        var e = <Rgba> end;
        var nr = Math.round(ctx.ease(time, s.r, e.r - s.r, duration));
        var ng = Math.round(ctx.ease(time, s.g, e.g - s.g, duration));
        var nb = Math.round(ctx.ease(time, s.b, e.b - s.b, duration));
        res = createRgb(nr, ng, nb);
        if (e.isHex && s.isHex) {
            res.isHex = true;
        }
        if (s.hasPercent) {
            res.hasPercent = true;
        }
    }
    else {
        var sh = <Hsla> start;
        var eh = <Hsla> end;
        var nh = Math.round(ctx.ease(time, sh.h, eh.h - sh.h, duration));
        var ns = Math.round(ctx.ease(time, sh.s, eh.s - sh.s, duration));
        var nl = Math.round(ctx.ease(time, sh.l, eh.l - sh.l, duration));
        res = createHsl(nh, ns, nl)
    }
    if (start.hasAlpha || end.hasAlpha) {
        res.a = ctx.ease(time, start.a, end.a - start.a, duration);
        res.hasAlpha = true;
    }
    return res.toString();
}

export interface IEasingResults<E>{
    easeValue: (ctx: IValueEaserContext) => E;
    value: E;
}

export function convertEasingValue<E>(val: E): IEasingResults<E>{
    if (typeof val === "number") {
        return <IEasingResults<E>><any>{
            easeValue: easeNumber,
            value: val
        }
    }
    else if (typeof val === "string") {
        try {
            var col = color(val);
            return <IEasingResults<E>><any>{
                easeValue: easeColor,
                value: col
            }
        }
        catch (err) {

        }
    }
    return {
        easeValue: easeAny,
        value: val
    }

}