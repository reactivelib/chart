/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {getEndX, IXIntervalData} from "../../../../datatypes/range";
import {procedure} from "@reactivelib/reactive";
import {IOptional, optional} from "@reactivelib/core";
import {IPointInterval} from "../../../../geometry/interval/index";
import {IReactiveRingBuffer, IReactiveXSortedRingBuffer} from "../../../reactive/collection/ring";
import {variable} from "@reactivelib/reactive";
import {IXSortedSeriesSystem} from "../x/index";
import {createHorizontalCandlestickDomainCalculator} from "../../../../math/domain/extremal/sorted/candlestick";
import {IXYAxis} from "../../axis";
import {CartesianSeries, IXYSeriesSystem} from "../series";
import {createHorizontalIntervalDomainCalculator} from "../../../../math/domain/extremal/sorted/interval";
import {createHorizontalValueDomainDomain} from "../../../../math/domain/extremal/sorted/value";
import {ICartesianXPoint} from "../../../../datatypes/value";
import {IHorizontalDataRangeShapeDataHolder} from "../../../data/shape/transform/xRange/index";
import {IXYChart} from "../../xy";
import {ReactiveSeriesMaxDomain} from "./index";
import {calculateExtremal2d} from "../../../../math/domain/extremal/d2/point";
import {ICancellable} from "@reactivelib/reactive";
import {deps} from "../../../../config/di";
import {XYChart} from "../../index";

export function calculateXDomain(data: IReactiveRingBuffer<IXIntervalData>): IOptional<IPointInterval>{
    if (data.length > 0){
        var xs = data.get(0);
        var xe = data.get(data.length - 1);    
        return optional({start: xs.x, end: getEndX(xe)});
    }
    return optional<IPointInterval>();
}

function candleMaxYDomain(xAxis: variable.IVariable<IXYAxis>, series: CartesianSeries){
    var calc = createHorizontalCandlestickDomainCalculator({
        xDomain: () => xAxis.value.window
    });
    return function(){
        var dom = calc(<IReactiveXSortedRingBuffer<any>>series.summarizedData);
        if (dom.present){
            var v = dom.value;
            return optional({
                start: v.ys,
                end: v.ye
            });
        }
        return optional<IPointInterval>();
    }
}

function intervalMaxYDomain(xAxis: variable.IVariable<IXYAxis>, series: IXSortedSeriesSystem){
    var calc = createHorizontalIntervalDomainCalculator({
        xDomain: () => xAxis.value.window
    });
    return function(){
        var dom = calc(series.summarizedData);
        if (dom.present){
            var v = dom.value;
            return optional({
                start: v.ys,
                end: v.ye
            });
        }
        return optional<IPointInterval>();
    }
}

function getSummarizedData(series: CartesianSeries){
    return <IReactiveXSortedRingBuffer<ICartesianXPoint>>series.summarizedData;
}

function getShapeData(series: CartesianSeries){
    return <IReactiveXSortedRingBuffer<IHorizontalDataRangeShapeDataHolder<ICartesianXPoint>>>series.shapeData;
}

function valueMaxYDomain(xAxis: variable.IVariable<IXYAxis>, series: CartesianSeries, stack: IOptional<any>){
    if (stack.present){
        getdata = <any>getShapeData;
        calc = createHorizontalIntervalDomainCalculator({
            xDomain: () => xAxis.value.window
        });
    }
    else
    {
        var getdata = getSummarizedData;
        var calc = createHorizontalValueDomainDomain({
            xDomain: () => xAxis.value.window
        });
    }
    return function(){
        series.shapeData;
        var dom = calc(getdata(series));
        if (dom.present){
            var v = dom.value;
            return optional({
                start: v.ys,
                end: v.ye
            });
        }
        return optional<IPointInterval>();
    }
}

function fillDomainX(series: CartesianSeries, xAxis: variable.IVariable<IXYAxis>, res: ReactiveSeriesMaxDomain, stack: IOptional<any>, origin: variable.IVariable<number>){
    var yDomainProvider = variable<() => IOptional<IPointInterval>>(null).listener((v) => {
        switch(series.dataType){
            case "point":
            v.value = valueMaxYDomain(xAxis, series, stack);
            break;
            case "candle":
            v.value = candleMaxYDomain(xAxis, series);
            break;
            case "interval":
            v.value = intervalMaxYDomain(xAxis, <IXSortedSeriesSystem><any>series);
            break;        
        }
    });
    var xDom = procedure(() => {
        var xd = calculateXDomain(series.data);
        if (xd.present){
            res.x.value = xd.value;
        }
        else
        {
            res.x.empty();
        }
        var ys = yDomainProvider.value();
        if (ys.present){
            var orig = origin.value;
            var y = ys.value;
            res.y.value = ys.value;        
            if (orig !== null){
                if (orig < y.start) {
                    y.start = orig;
                }
                if (orig > y.end){
                    y.end = orig;
                }
            }
        }
        else{
            res.y.empty();
        }
    });
    return {
        cancel: () => {
            yDomainProvider.$r.cancel();
            xDom.cancel();
        }
    }
}

function fillDomainXY(series: CartesianSeries, res: ReactiveSeriesMaxDomain){
    var p = procedure(p => {
        var data = series.data;
        if (data.length === 0){
            res.x.empty();
            res.y.empty();
        }
        var r = calculateExtremal2d(data);
        res.x.value = {start: r.xs, end: r.xe};
        res.y.value = {start: r.ys, end: r.ye};
    });
    return p;
}

export default function(chart: XYChart, series: CartesianSeries,
    data: variable.IVariable<any>, xAxis: variable.IVariable<IXYAxis>, stack: IOptional<any>, origin: variable.IVariable<number>){
    var res = new ReactiveSeriesMaxDomain();
    var last: ICancellable = null;
    var yDom = procedure(() => {        
        if (last){
            last.cancel();
        }
        if (chart.type === "xy"){
            fillDomainXY(series, res);
        }
        else{
            fillDomainX(series, xAxis, res, stack, origin);
        }
    });
    series.cancels.push({
        cancel: () => {
            yDom.cancel();
            if (last){
                last.cancel();
            }
        }
    });
    return res;
}