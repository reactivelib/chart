import {IPointInterval} from "./index";

export function resizeIntervalByOrigin(ivl: IPointInterval, origin: number): IPointInterval{

    var s = ivl.start;
    var e = ivl.end;
    s = Math.min(origin, s);
    e = Math.max(origin, e);
    return {
        start: s, end: e
    }

}