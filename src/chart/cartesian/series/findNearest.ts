/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {getXSize, IXIntervalData} from "../../../datatypes/range";
import {IInterval, intervalDistance} from "../../../geometry/interval/index";
import {IRectangle, pointRectangleDistance} from "../../../geometry/rectangle/index";
import {IReactiveXSortedRingBuffer} from "../../reactive/collection/ring";
import {IXSortedSeriesSystem} from "./x/index";
import {ISeriesFocusData} from "../focus";
import {IXY2dSeries} from "../xy/series/base";
import {ITransformation} from "../../../math/transform/matrix";
import {IPoint} from "../../../geometry/point";
import {CartesianSeries} from "./series";
import {variable} from "@reactivelib/reactive";
import {XYChart} from "..";
import {mapRectangle} from "../../../math/transform/geometry";

export function findNearestXSortedData(series: IXSortedSeriesSystem, rect: IRectangle): ISeriesFocusData[]{
    var ser = series;
    var tr = series.area.mapper.copy().inverse();
    if (!tr.present){
        return [];
    }
    var mr = mapRectangle(rect, tr.value);
    var data = findNearestDataForCollection({start: mr.x, size: mr.width}, ser.summarizedData);
    if (!data){
        return [];
    }
    return data.map(d => {
        return {
            series: series,
            index: d.index,
            data: d.data,
            screenBoundingBox: null
        }
    });
}

function pointDist(pt: IRectangle, pt2: IPoint, mapper: ITransformation){
    return pointRectangleDistance(mapper.transform(pt2.x, pt2.y), pt);
}

function findNearestData( s: IXY2dSeries, pt: IRectangle, mapper: ITransformation){
    var dist = Number.MAX_VALUE;
    var nearest: IPoint[] = [];
    var it = s.summarizedData.iterator();
    while(it.hasNext()){
        var p = it.next();
        (<any>p).index = it.index;
        var nd = pointDist(pt, p, mapper);
        if (nd < dist){
            nearest = [p];
            dist = nd;
        }
        else if (nd === dist){
            nearest.push(p);
        }
    }
    return nearest;
}

export function findNearestXYData(series: IXY2dSeries, r: IRectangle): ISeriesFocusData[]{
    var dats = findNearestData(series, r, series.area.mapper);
    return dats.map(d => {
        return {
            data: d,
            index: (<any>d).index,
            series: series,
            screenBoundingBox: null
        }
    });
}

interface INearestData{
    data: IXIntervalData;
    index: number;
}

function findNearestDataForCollection(index: IInterval, data: IReactiveXSortedRingBuffer<IXIntervalData>): INearestData[]
{
    var middle = index.start + index.size / 2;
    var smallestDist = Number.MAX_VALUE;
    var indx = data.lastSmaller(middle, true);
    var res: INearestData[] = [];
    while(indx > -1){
        var ivl = data.get(indx);
        var smDist = intervalDistance(index, {start: ivl.x, size: getXSize(ivl)});
        if (smDist < smallestDist){
            res = [{
                index: indx,
                data: ivl
            }];
            smallestDist = smDist;
        }
        else if (smDist === smallestDist){
            res.push({
                index: indx,
                data: ivl
            })
        }
        else {
            break;
        }
        indx--;
    }
    indx = data.firstBigger(middle, false);
    while(indx < data.length){
        var ivl = data.get(indx);
        var smDist = intervalDistance(index, {start: ivl.x, size: getXSize(ivl)});
        if (smDist < smallestDist){
            res = [{
                index: indx,
                data: ivl
            }];
            smallestDist = smDist;
        }
        else if (smDist === smallestDist){
            res.push({
                index: indx,
                data: ivl
            })
        }
        else {
            break;
        }
        indx++;
    }
    return res;
}

export default function findNearest(series: CartesianSeries, chart: XYChart){
    var res = variable<(series: CartesianSeries, r: IRectangle) => ISeriesFocusData[]>(null).listener(v => {
        if (chart.type === "xy"){
            v.value = <any>findNearestXYData;
        }
        else{
            v.value = <any>findNearestXSortedData;
        }
    });
    series.cancels.push(res.$r);
    return res;
}