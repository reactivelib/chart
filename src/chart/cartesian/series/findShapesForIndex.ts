/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CartesianSeries} from "./series";
import {ISeriesRenderer, ISeriesShape} from "../../series/render/base";
import {XYChart} from "..";
import {variable} from "@reactivelib/reactive";
import {deps} from "../../../config/di";

export function findShapesForIndexXY(this: void, series: CartesianSeries, indx: number) {
    return [series.renderer].filter(c => "findShapesByIndex" in c).map((c: ISeriesRenderer) => c.findShapesByIndex(indx)).reduce((p, c) => p.concat(c), []);
}

export function findShapesForIndex(this: void, series: CartesianSeries, index: number): ISeriesShape[] {
    var c = series.renderer;
    var res: ISeriesShape[] = [];
    if (c.findShapesByIndex){
         res = res.concat(c.findShapesByIndex(series.shapeDataProvider.dataToShapeIndex(index)));
    }
    return res;
}

export default function findShapes(series: CartesianSeries, chart: XYChart){
    var vari = variable(null).listener(v => {
        if (chart.type === "xy"){
            v.value = findShapesForIndexXY;
        }
        else{
            v.value = findShapesForIndex;
        }
    });
    series.cancels.push(vari.$r);
    return function(this: CartesianSeries, indx: number){
        return vari.value(this, indx);
    }
}