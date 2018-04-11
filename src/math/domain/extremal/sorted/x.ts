import {IXSortedRingBuffer} from "../../../../collection/array/ring";
import {getEndX, IXIntervalData} from "../../../../datatypes/range";
import {IOptional, optional} from "@reactivelib/core";
import {IPointInterval} from "../../../../geometry/interval/index";

export function calculateXDomain(data: IXSortedRingBuffer<IXIntervalData>): IOptional<IPointInterval>{
    if (data.length > 0){
        var xs = data.get(0);
        var xe = data.get(data.length - 1);
        var dat = data.findOne(xe.x);
        return optional({start: xs.x, end: getEndX(dat)});
    }
    return optional<IPointInterval>();
}