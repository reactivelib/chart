/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator} from "../../../../../collection/iterator/index";
import {array, node, variable} from "@reactivelib/reactive";
import {IRadiusScale, IRadiusScaleSettings} from "./index";
import {IMinMax} from "../../../../../collection/array/index";
import {map1d} from "../../../../../math/transform/index";
import {IRadiusPoint} from "../../../../../datatypes/radius";

export function calculateMaxRadius(data: IIterator<IRadiusPoint>){
    var min = Number.MAX_VALUE;
    var max = -Number.MAX_VALUE;
    while(data.hasNext()){
        var p = data.next();
        min = Math.min(p.r, min);
        max = Math.max(p.r, max);
    }
    return {
        min: min,
        max: max
    };
}


class MaxRadiusCalc{

    private r_radius: variable.IReactiveVariable<IMinMax>;

    get radius(){
        return this.r_radius.value;
    }

    set radius(v){
        this.r_radius.value = v;
    }

    constructor(public getData: () => IIterator<IRadiusPoint> ){
        this.r_radius = variable<IMinMax>(null).listener(v => {
            v.value = calculateMaxRadius(this.getData());
        });
    }

    public cancel(){
        this.r_radius.$r.cancel();
    }

}

export function calculateAreaZScaleVariable(series: array.IReactiveArray<() => IIterator<IRadiusPoint>>, maxRadius: number, minRadius: number): variable.IReactiveVariable<(n: number) => number>{
    var radi: {[s: string]: MaxRadiusCalc} = {};
    var n = node();
    series.onUpdateSimple({
        add: (el: () => IIterator<IRadiusPoint>, indx) => {
            radi[indx] = new MaxRadiusCalc(el);
            n.changedDirty();
        },
        remove: (el: () => IIterator<IRadiusPoint>, indx) => {
            var r = radi[indx];
            delete radi[indx];
            r.cancel();
            n.changedDirty();
        },
        init: true
    });
    var res: variable.IReactiveVariable<(n: number) => number> = variable<(n: number) => number>(null).listener(v => {
        var min = Number.MAX_VALUE;
        var max = -Number.MAX_VALUE;
        for (var i in radi){
            max = Math.max(max, radi[i].radius.max);
            min = Math.min(max, radi[i].radius.min);
        }
        if(max === -Number.MAX_VALUE){
            v.value = n => 10;
        }
        else
        {
            var areaMin = minRadius * minRadius * Math.PI;
            var areaMax = maxRadius * maxRadius * Math.PI;
            var mapper = map1d({start: min, end: max}).to({start: areaMin, end: areaMax}).create();
            v.value = (x: number) => {
                var area = mapper(x);
                return Math.sqrt(area / Math.PI);
            };
        }
        n.observed();
    });
    return res;
}


function getRScale(this: MinMaxSeriesRadiusScale){
    return this.r_rScale.value;
}

export class MinMaxSeriesRadiusScale implements IRadiusScale{

    public series = array<() => IIterator<IRadiusPoint>>();
    public r_rScale = variable<(n: number) => number>(n => n);
    public id: string;

    constructor(public maxRadius = 40, public minRadius = 10){
        this.r_rScale = calculateAreaZScaleVariable(this.series, maxRadius, minRadius);
    }

    get rScale(){
        return this.r_rScale.value;
    }

    public addSeries(series: () => IIterator<IRadiusPoint>){
        this.series.push(series);
    }

    public removeSeries(series: () => IIterator<IRadiusPoint>){
        this.series.remove(this.series.indexOf(series));
    }

    public getRadius(val: number){
        return this.rScale(val);
    }

}

export function createAutoRadiusScale(settings: IRadiusScaleSettings){
    var mm = new MinMaxSeriesRadiusScale(settings.maxRadius || 40, settings.minRadius || 6);
    mm.id = settings.id;
    return mm;
}