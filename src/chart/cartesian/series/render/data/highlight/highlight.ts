/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CartesianSeries, IXYSeriesData, IXYSeriesSystem} from "../../../series";
import {ICanvasChildShape} from "../../../../../render/canvas/shape/index";
import {ICancellable} from "@reactivelib/reactive";
import {DataHighlightGroupCollection, IHighlightedDataGroup} from "./group/shape/index";
import {FlexibleChildGroupRenderer} from "../../../../../render/canvas/shape/group/index";
import {ChartCenter} from "../../../../../core/center/index";

export interface IDataHighlighter extends ICancellable{

    highlight(index: number[]): void;

}

/**
 * Highlights series data in a chart
 */
export interface IChartDataHighlighter extends ICancellable{

    /**
     * 
     * Highlights the given set of data. If this method was called previously, then it will
     * unhighlight any data that was highlighted before and is not included in the current set.
     * 
     * @param {IXYSeriesData[]} data The data to highlight
     */
    highlight(data: IXYSeriesData[]): void;
    
}

export class SeriesHighlightContext implements IDataHighlighter{
    
    public cancellable: ICancellable;
    
    constructor(public series: CartesianSeries, public group: IHighlightedDataGroup, center: ChartCenter){
        var rend = new FlexibleChildGroupRenderer();
        var layer = center.getLayer(10).getCanvas();
        Object.defineProperty(rend, "mapper", {
            get: function(){
                return series.area.mapper;
            },
            configurable: true,
            enumerable: true
        });
        layer.child.push(rend);
        rend.addChild(this.group);
        this.cancellable = {
            cancel: () => {
                    layer.child.remove(layer.child.indexOf(rend));
                }
        };
    }
    
    public highlight(index: number[]){
        this.group.highlight(index);
    }
    
    public cancel(){
        this.cancellable.cancel();
    }
    
}

export interface IDataHighlightShapeProvider{

    /**
     * Highlight the given data
     * @returns a cancellable that removes the highlighting
     */
    highlightDataAtIndex(): IHighlightedDataGroup;

}

export interface IDataHighlightProvidingShape{
    createHighlighter(): ICanvasChildShape;
}

function findNaturalHighlight(series: CartesianSeries): IHighlightedDataGroup{
    var res:IHighlightedDataGroup[] = [];
    var c = series.renderer;
    if ((<IDataHighlightShapeProvider><any>c).highlightDataAtIndex) {
        var hl = (<IDataHighlightShapeProvider><any>c).highlightDataAtIndex();
        if (hl){
            res.push(hl);
        }
    }
    return new DataHighlightGroupCollection(res);
}

export function highlightDataNaturally(series: CartesianSeries, alternative: (series: CartesianSeries) => IHighlightedDataGroup): IHighlightedDataGroup{
    var res = findNaturalHighlight(series);
    if (!res.getChildren().hasNext()){
        return alternative(series);
    }
    return res;
}

export function makeShapeHighlightable(highlighter: (shape: ICanvasChildShape) => ICanvasChildShape){
    return {
        createHighlighter: function(this: ICanvasChildShape){
            return highlighter(this);
        }
    }
}