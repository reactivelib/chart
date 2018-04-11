/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../../../../geometry/interval/index";
import {IPoint} from "../../../../../geometry/point/index";
export interface IGridIntervalSettings{

    start?: number;
    end?: number;

}

/*

function overflowHorizontal(intervals: IGridSizes, overflow: IGridIntervalSettings){
    if (!intervals){
        return {
            start: 0, end: 0
        }
    }
    var zerox = intervals.xToInterval.firstSmaller(0, true).value;
    var sintvl = intervals.xToInterval.firstBigger(-overflow.start, true).value;
    var eintvl = intervals.xToInterval.firstSmaller(overflow.end, true).value;
    if (eintvl.start < sintvl.start){
        var d = eintvl;
        eintvl = sintvl;
        sintvl = d;
    }
    var start = sintvl.start - zerox.start;
    var end = eintvl.start + eintvl.size - (zerox.start + zerox.size);
    return {start: start, end: end};
}

function overflowVertical(intervals: IGridSizes, overflow: IGridIntervalSettings){
    if (!intervals){
        return {
            start: 0, end: 0
        }
    }
    var zerox = intervals.yToInterval.firstSmaller(0, true).value;
    var sintvl = intervals.yToInterval.firstBigger(-overflow.start, true).value;
    var eintvl = intervals.yToInterval.firstSmaller(overflow.end, true).value;
    if (eintvl.start < sintvl.start){
        var d = eintvl;
        eintvl = sintvl;
        sintvl = d;
    }
    var start = sintvl.start - zerox.start;
    var end = eintvl.start + eintvl.size - (zerox.start + zerox.size);
    return {start: start, end: end};
}

export function getLeftLinePosition(intervals: IGridSizes, x: number){
    var res = intervals.xToInterval.firstSmaller(x, false);
    if (res){
        return res.value.start + res.value.size;
    }
    return getXCellPosition(intervals, x);
}

export function getRightLinePosition(intervals: IGridSizes, x: number){
    var res = intervals.xToInterval.firstBigger(x, false);
    if (res){
        return res.value.start;
    }
    return getXCellPosition(intervals, x);
}

export function getYCellPosition(intervals: IGridSizes, y: number){
    var res = intervals.yToInterval.firstSmaller(y, true);
    if (res && res.key === y){
        return res.value.start;
    }
    return null;
}

export function getXCellPosition(intervals: IGridSizes, x: number){
    var res = intervals.xToInterval.firstBigger(x, true);
    if (res && res.key === x){
        return res.value.start + res.value.size;
    }
    return null;
}

export function getTopLinePosition(intervals: IGridSizes, x: number){
    var res = intervals.yToInterval.firstSmaller(x, false);
    if (res){
        return res.value.start + res.value.size;
    }
    return getYCellPosition(intervals, x);
}

export function getBottomLinePosition(intervals: IGridSizes, x: number){
    var res = intervals.yToInterval.firstBigger(x, false);
    if (res){
        return res.value.start;
    }
    return getYCellPosition(intervals, x);
}

export interface IGridIntervalSetter{
    calculateOverflow(): IPointInterval;
    applyOverflow(overflow: IPointInterval, start: IPoint, end: IPoint): void;
}

export class DummyGridIntervalSetter implements IGridIntervalSetter{

    calculateOverflow(): IPointInterval{
        return null;
    }
    
    applyOverflow(overflow: IPointInterval, start: IPoint, end: IPoint): void{
        
    }
    
}

/*

class HorizontalGridIntervalSetter implements IGridIntervalSetter{
    
    constructor(public grid: SGrid, public overflow: IGridIntervalSettings){
        
    }
    
    public calculateOverflow(): IPointInterval{
        return overflowHorizontal(this.grid.gridIntervals, this.overflow);
    }
    
    public applyOverflow(overflow: IPointInterval, start: IPoint, end: IPoint){
        if (start.x < end.x){
            start.x += overflow.start;
            end.x += overflow.end;
        }
        else {
            end.x += overflow.start;
            start.x += overflow.end;
        }
    }
    
}

class VerticalGridIntervalSetter implements IGridIntervalSetter{
    constructor(public grid: SGrid, public overflow: IGridIntervalSettings){

    }

    public calculateOverflow(): IPointInterval{
        return overflowVertical(this.grid.gridIntervals, this.overflow);
    }

    public applyOverflow(overflow: IPointInterval, start: IPoint, end: IPoint){
        if (start.y < end.y){
            start.y += overflow.start;
            end.y += overflow.end;
        }
        else {
            end.y += overflow.start;
            start.y += overflow.end;
        }
    }
}

export function provideHorizontalGridIntervalSetter(grid: SGrid, overflow: IGridIntervalSettings): IGridIntervalSetter{
    return new HorizontalGridIntervalSetter(grid, overflow);
}

export function provideVerticalGridIntervalSetter(grid: SGrid, overflow: IGridIntervalSettings): IGridIntervalSetter{
    return new VerticalGridIntervalSetter(grid, overflow);
}

*/