import {IPointInterval} from "../../../geometry/interval/index";
import {variable} from "@reactivelib/reactive";
import {map1d} from "../../transform/index";
import {CoordinateOrigin} from "../../../chart/render/canvas/shape/group/transform/mapper";
import {IDimension} from "../../../geometry/rectangle/index";

interface IScreenMapper{
    value: variable.IVariable<(n: number) => number>;
}


function createScreenMapper(getSize: () => number, domain: IPointInterval): IScreenMapper{
    var v = variable<(n: number) => number>(null).listener(v => {
        var md = domain;
        var mapper = map1d({start: 0, end: getSize()}).to({start: 0, end: md.end}).create();
        v.value = mapper;
    });
    return {
        get value(){
            return v;
        }
    }
}

export function createSizeGetterByYCoordinateOrigin(origin: CoordinateOrigin, dimension: IDimension) {
    if (origin === "bottom" || origin === "top") {
        return function(){
            return dimension.height;
        }
    }
    return function(){
        return dimension.width;
    }
}

export default function calculateOffsetAdd(s: string | number, domain: IPointInterval, getSize: () => number, end = false, log = false){
    var leftAdd: () => number;
    if (typeof s === "number"){
        leftAdd = () => <number>s;
    }
    else
    {
        if (log){
            s = (parseFloat(s) || 0) / 100;
            if (end){
                leftAdd = function(){
                    var md = domain;
                    return md.end * <number>s;
                }
            }
            else
            {
                leftAdd = function(){
                    var md = domain;
                    return md.start * <number>s;
                }
            }
        }
        else if (/px$/.test(s)){
            s = parseFloat(s) || 0;
            var sm = createScreenMapper(getSize, domain);
            leftAdd = function(){
                return Math.abs(sm.value.value(<number>s));
            }
        }
        else if (/%$/.test(s)){
            s = (parseFloat(s) || 0) / 100;
            leftAdd = function(){
                var md = domain;
                return (md.end - md.start) * <number>s;
            }
        }
        else {
            s = parseFloat(s);
            leftAdd = () => <number>s;
        }
    }
    return leftAdd;
}