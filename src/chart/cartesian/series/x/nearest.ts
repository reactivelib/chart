/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {getXSize, IXIntervalData} from "../../../../datatypes/range";
import {IInterval, intervalDistance} from "../../../../geometry/interval/index";
import {ISeriesFocusData} from "../../focus/index";
import {IRectangle} from "../../../../geometry/rectangle/index";
import {mapRectangle} from "../../../../math/transform/geometry";
import {IReactiveXSortedRingBuffer} from "../../../reactive/collection/ring";
import {CartesianSeries} from "../series";

export function findNearestXSortedData(this: CartesianSeries, rect: IRectangle): ISeriesFocusData[]{
    var ser = this;
    var tr = ser.area.mapper.copy().inverse();
    if (!tr.present){
        return [];
    }
    var mr = mapRectangle(rect, tr.value);
    var data = findNearestDataForCollection({start: mr.x, size: mr.width}, <IReactiveXSortedRingBuffer<IXIntervalData>>ser.summarizedData);
    if (!data){
        return [];
    }
    return data.map(d => {
        return {
            series: this,
            index: d.index,
            data: d.data,
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