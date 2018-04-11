import {IXYAxis, IXYAxisSystem} from "./index";
import {variable} from "@reactivelib/reactive";
import {procedure} from "@reactivelib/reactive";

function minSize(axis: IXYAxis){
    var v = variable(1);
    var domain = axis.domain;
    procedure(() => {
        var size = domain.end - domain.start;
        if (size > 0){
            var ms = 0;
            axis.series.forEach(s => {
                var l = s.data.length;
                if (l > 0){
                    ms = Math.max(ms, 2 * (size / (Math.max(1, l))));
                }
            });
            if (ms === 0){
                ms = 1;
            }
            v.value = ms;
        }
        else {
            v.value = 1;
        }
    });
    return v;
}

export default function(axis: IXYAxisSystem, primary: boolean){
    if (primary){
        return minSize(axis);
    }
}