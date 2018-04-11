/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array} from "@reactivelib/reactive";
import {
    fitRectanglesByDistance, IAxisLabelsLayoutSettings, IFitnessAndRectangleCollection,
    summarizeFitnessAndRectangles
} from "../../../../geometry/layout/rectangle/incremental/fit";
import {IFlexibleTickAxis} from "../../../../math/domain/axis/axis";
import {estimateDistance} from "../../../../geometry/layout/rectangle/incremental/distance";
import {mapIterator} from "../../../../collection/iterator/index";
import {IOptional, optional} from "@reactivelib/core";
import {HeightInterval, IDimension, IRectangle, WidthInterval} from "../../../../geometry/rectangle/index";
import {create, deps, inject, join} from "../../../../config/di";
import {XYChart} from "../../index";
import {ICartesianViewportSystem} from "../../area/index";
import {IXYAxis} from "../../axis/index";
import {AxisCollection} from "../../axis/collection/index";
import {IInterval} from "../../../../geometry/interval/index";
import {IRectangleLabel} from "../../../render/canvas/label/position/index";
import {variable} from "@reactivelib/reactive";
import {CoreChart} from "../../../core/basic";
import {IChartAxisLabels} from "../../label";
import {FlexibleChildGroupRenderer} from "../../../render/canvas/shape/group/index";
import {ChartCenter} from "../../../core/center";
import {XYAxisSystem} from "../index";

export function getReferenceAxisLabelSize(labels: array.IReactiveArray<IChartAxisLabels>, primary: IXYAxis, provideSize: (r: IDimension) => number){
    var lbls = labels.array;
    for (var i=0; i < lbls.length; i++){
        var l = lbls[i];
        if (l.axis === primary){
            var exl = l.getExampleLabel();
            if (exl){
                return provideSize(exl);
            }
        }
    }
    return 60;
}

export interface IChartLabelSynchronizerSettings{

    xAxis: IChartAxisLabelLayoutSettings;
    yAxis: IChartAxisLabelLayoutSettings;

}

export interface IChartAxisLabelLayoutSettings{

    axisLabels: array.IReactiveArray<IChartAxisLabels>;
    referenceAxis: variable.IVariable<IXYAxis>;
    referenceLabelWidthProvider: () => number;
    referenceFullWidthProvider: () => number;
    beforeGeneration: () => void;
}

export var ChartAxisLabelLayoutSettingsFactories = {
    axisLabelsLayoutSettings: deps((axisLabels, referenceAxis,
        referenceLabelWidthProvider, referenceFullWidthProvider, beforeGeneration) => {
        return {
            axisLabels: axisLabels,
            referenceAxis: referenceAxis,
            referenceLabelWidthProvider: referenceLabelWidthProvider,
            referenceFullWidthProvider: referenceFullWidthProvider,
            beforeGeneration: beforeGeneration
        }
    }, ["axisLabels", "referenceAxis", "referenceLabelWidthProvider", "referenceFullWidthProvider", "beforeGeneration"])
}

export class LabelLayout{

    @create(function(this: XLabelLayout){
        var vari = variable<(r: IRectangle) => IInterval>(null).listener((v) => {
            switch(this.axes.origin){
                case "bottom":
                case "top":
                    v.value = (r: IRectangle) => new HeightInterval(r);
                    break;
                default:
                    v.value = (r: IRectangle) => new WidthInterval(r);
            }
        });
        this.axes.cancels.push(vari.$r);
        return vari;
    })
    public r_intervalProvider: variable.IVariable<(r: IDimension) => IInterval>;

    get intervalProvider(){
        return this.r_intervalProvider.value;
    }

    set intervalProvider(v){
        this.r_intervalProvider.value = v;
    }

    @inject
    axisLabels: array.IReactiveArray<IChartAxisLabels>;
    @inject
    axes: AxisCollection

    @create(function(this: LabelLayout){
        return this.axes.collectionCreation.r_primary
    })
    referenceAxis: variable.IVariable<IXYAxis>;
    referenceLabelWidthProvider: () => number;
    referenceFullWidthProvider: () => number;
    beforeGeneration: () => void;

    @create
    axisLabelsLayoutSettings: IChartAxisLabelLayoutSettings;
    create_axisLabelsLayoutSettings(): IChartAxisLabelLayoutSettings{
        return {
            axisLabels: this.axisLabels,
            referenceAxis: this.referenceAxis,
            referenceLabelWidthProvider: this.referenceLabelWidthProvider,
            referenceFullWidthProvider: this.referenceFullWidthProvider,
            beforeGeneration: this.beforeGeneration
        }
    }
}

export class XLabelLayout extends LabelLayout{

    @inject
    center: ChartCenter
    @inject
    chart: XYChart

    @create(function(this: XLabelLayout){
        return () => this.intervalProvider(this.center).size;
    })
    referenceFullWidthProvider: () => number;

    @create(function(this: XLabelLayout){
        return () => getReferenceAxisLabelSize(this.axisLabels, this.chart.viewports.primary.xAxis, (d) => this.intervalProvider(d).size);
    })
    referenceLabelWidthProvider: () => number;

    @create(function(this: XLabelLayout){
        return () => {
            this.axes.synchronizer();
            this.chart.viewports.collection.forEach((a:ICartesianViewportSystem) => a.recalculate());
        }
    })
    beforeGeneration: () => void;

    @create(function(this: XLabelLayout){
        var sets = new ChartAxisLabelLayoutSettings(this.axisLabelsLayoutSettings);
        return function(){
            var xRects = fitRectanglesByDistance(sets);
            applyRectangles(sets, xRects, r => new WidthDimension(r));
        }
    })
    synchronize: () => void

}

export class YLabelLayout extends LabelLayout{

    @inject
    center: ChartCenter
    @inject
    chart: XYChart

    @create(function(this: XLabelLayout){
        return () => this.intervalProvider(this.center).size;
    })
    referenceFullWidthProvider: () => number;

    @create(function(this: XLabelLayout){
        return () => getReferenceAxisLabelSize(this.axisLabels, <IXYAxis>this.chart.viewports.primary.yAxis, (d) => this.intervalProvider(d).size);
    })
    referenceLabelWidthProvider: () => number;

    @create(function(this: XLabelLayout){
        return () => {
            this.axes.synchronizer();
            this.chart.viewports.collection.forEach((a:ICartesianViewportSystem) => a.recalculate());
        }
    })
    beforeGeneration: () => void;

    @create(function(this: XLabelLayout){
        var sets = new ChartAxisLabelLayoutSettings(this.axisLabelsLayoutSettings);
        return function(){
            var xRects = fitRectanglesByDistance(sets);
            applyRectangles(sets, xRects, r => new HeightDimension(r));
        }
    })
    synchronize: () => void

}

export class ChartAxisLabelLayoutSettings implements IAxisLabelsLayoutSettings{

    constructor(public settings: IChartAxisLabelLayoutSettings){
        
    }

    public estimateDistance(): IOptional<number>{
        if ((<IXYAxis>this.settings.referenceAxis.value).type === "log"){
            return optional(1);
        }
        const ax = <XYAxisSystem>this.settings.referenceAxis.value;
        var ticks = ax.settings.ticks;
        var minDist = 0;
        if (ticks){
            if (ticks.minDistance){
                minDist = ticks.minDistance;
            }
        }
        var res = estimateDistance(this.settings.referenceAxis.value.window, this.settings.referenceLabelWidthProvider(), this.settings.referenceFullWidthProvider());
        if (res.present){
            return optional(Math.max(minDist, res.value));
        }
        return res;
    }

    public provideRectangles(distance: number): IFitnessAndRectangleCollection{
        this.settings.referenceAxis.value.ticks.distance = distance;
        this.settings.beforeGeneration();
        return summarizeFitnessAndRectangles(mapIterator(this.settings.axisLabels.iterator(), a => a.generate()));
    }

    public more(): number{
        this.settings.referenceAxis.value.ticks.morePositions();
        return this.settings.referenceAxis.value.ticks.distance;
    }

    public less(): number{
        this.settings.referenceAxis.value.ticks.lessPositions();
        return this.settings.referenceAxis.value.ticks.distance;
    }

}

function applyRectangles(settings: ChartAxisLabelLayoutSettings, results: IOptional<IRectangle[][]>, ivl: (r: IDimension) => {size: number} ){
    if (results.present){
        results.value.forEach((v, i) => {
            var ax = settings.settings.axisLabels.get(i);
            ax.consume(<IRectangleLabel[]>v);
            //var sp = spanningFromCollection(arrayIterator(v));
            //ivl(ax).size = ivl(sp).size;
        });
    }
}

class WidthDimension{

    constructor(public dim: IDimension){

    }

    get size(){
        return this.dim.width;
    }

    set size(s: number){
        this.dim.width = s;
    }

}

class HeightDimension{
    constructor(public dim: IDimension){

    }

    get size(){
        return this.dim.height;
    }

    set size(s: number){
        this.dim.height = s;
    }
}