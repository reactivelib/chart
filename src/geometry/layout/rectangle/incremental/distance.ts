import {IOptional, optional} from "@reactivelib/core";
import {IPointInterval} from "../../../interval/index";

export function estimateDistance(window: IPointInterval, itemSize: number, wholeSize: number): IOptional<number>{
    var height = itemSize;
    var axisDim = wholeSize;
    if (axisDim === 0 || height === 0)
    {
        return optional<number>();
    }
    var maxNr = Math.max(1, axisDim / height);
    var d = (window.end - window.start) / maxNr;
    if (d === 0)
    {
        return optional<number>();
    }
    return optional(d);
}