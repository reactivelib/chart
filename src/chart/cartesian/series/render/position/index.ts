import {ICartesianSeries, IDiscreteIntervalSettings, IXYSeriesSystem} from "../../series";
import {variable} from "@reactivelib/reactive";
import { IOptional } from "@reactivelib/core";

export class Stack{
    
}

export interface IDiscreteContext{

    position: number;
    size: number;
    nr: number;
    stack: string;
    shared: boolean;
    series: IXYSeriesSystem;

}

export function getShapeInterval(xs: number, xe: number, ctx: IDiscreteContext){
    var w = xe - xs + 1;
    var cw = w  * ctx.size;
    var wp = cw / ctx.nr;
    var ow = (w - cw) / 2;
    var startSegment = xs + wp*ctx.position;
    var startX = startSegment + ow - 0.5;
    return {
        xs: startX,
        xe: startX + wp
    }
}

export interface ISeriesWithXCategory extends ICartesianSeries{
    xCategory: IOptional<IDiscreteContext>;
}

export interface ISeriesWithYCategory extends ICartesianSeries{
    yCategory: IOptional<IDiscreteContext>;
}

function dummy(){
    
}

export function createCategoricalContext(settings: IDiscreteIntervalSettings): IDiscreteContext{
    return variable.transformProperties({
        position: 0,
        size: "size" in settings ? settings.size : 0.8,
        nr: 1,
        refresh: dummy
    })
}