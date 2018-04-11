/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IColorScaleSettings, IColorScale} from "./index";
import {RedBlackTreeSortedCollection} from "../../../../reactive/sorted";

interface IDiscreteColor{
    color: string;
    value: number;
    include?: boolean;
}

class DiscreteColorScale implements IColorScale{

    public scales = new RedBlackTreeSortedCollection<IDiscreteColor, IDiscreteColor>((a, b) => {
        if (a === b){
            return 0;
        }
        if (a.value === b.value){
            if (a.include){
                if (b.include){
                    return 0;
                }
                return 1;
            }
            if (b.include){
                return -1;
            }
            return 0;
        }
        return a.value - b.value;
    });
    public id: string;

    getColor(val: number): string{
        var k = {color: <string>null, value: val, include: true};
        var f = this.scales.firstBigger(k, true);
        if (!f){
            f = this.scales.firstSmaller(k, true);
        }
        return f.value.color;
    }

}

export function createDiscreteColorScale(settings: IColorScaleSettings): IColorScale{
    var cols = settings.colors;
    var sc = new DiscreteColorScale();
    cols.forEach(col => {
        var dc = {
            color: col.color,
            value: col.value,
            include: "include" in col ? col.include : true
        }
        sc.scales.insert(dc, dc);
    });
    return sc;
}