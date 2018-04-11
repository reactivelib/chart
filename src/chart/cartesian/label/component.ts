/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPaddingSettings} from "../../../geometry/rectangle/index";
import {ICartesianChart} from "../index";
import {deps, buildAndFetch, IContainer, join, inject, create} from "../../../config/di";
import {ChartAxisLabels} from "./index";
import {ILabelStyle, LabelType} from "../../render/canvas/label/cache/index";
import {
    IRelativePosComponentFactory,
    RelativePositionedComponentProxy
} from "../../../component/layout/axis/component/factory";
import {ComponentPosition, IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative";
import {IComponentConfig} from "../../../component/layout/axis";
import {getRectangleSide} from "../../../geometry/layout/rectangle/incremental/side";
import {INamedRelativePosComponentFactory} from "../../component";

export interface ICartesianLabelRendererContext{
    
    chart: ICartesianChart;
    pos: number;
    id: string;
    
}

/**
 * Contains the settings for the labels visualizing the tick locations of an axis
 * @editor
 */
export interface ICartesianChartAxisLabelSettings{
    /**
     * Adds space around the label.
     */
    space?: IPaddingSettings | number;
    /**
     * How to format the label. 
     */
    format?: any;
    /**
     * The id of the axis the labels will be generated for. If not specified, the labels will be generated for the primary
     * axis.
     */
    axis?: string;
    /**
     * The chart this labels will be generated for. If not specified, will be the chart this labels have been defined in.
     */
    chart?: ICartesianChart;
    /**
     * If set, will not render the last x tick locations
     */
    removeAtEnd?: number;
    /**
     * If set, will not render the first x tick locations
     */
    removeAtStart?: number;
    /**
     * A user defined function to render the label. If the function returns a string, the string will be converted
     * to a html, svg or canvas label, depending on the chart settings and using the given @api{style}. Otherwise, it is expected that the function
     * returns a @api{render.canvas.IRectangleCanvasShape}.
     * @param ctx
     */
    renderer?:((ctx: ICartesianLabelRendererContext) => LabelType);
    /**
     * The style to use to render the labels.
     */
    style?: ILabelStyle;
}

/**
 * A component that draws labels at the tick locations of an axis.
 * @editor
 */
export interface IAxisLabelComponentSettings extends IComponentConfig, ICartesianChartAxisLabelSettings{
    type: "axis-labels";
}

export class AxisLabelGridComponentFactory implements INamedRelativePosComponentFactory{

    @inject
    $container;

    name = "axis-labels"


    @create
    createChartAxis(settings: ICartesianChartAxisLabelSettings, gridSettings){
        return new ChartAxisLabels(settings, gridSettings)
    }

    public create(comp: IRelativePositionedGridElement): IRelativePositionedGridElement{
        var c = comp.component;
        if (typeof c === "string"){
            c = {
                type: c
            }
        }
        var labels = this.createChartAxis(<ICartesianChartAxisLabelSettings>c, comp);
        var res = new RelativePositionedComponentProxy(comp, labels);
        res.cancel = () => {
            labels.cancel();
        }
        Object.defineProperties(res, {
            resizeHeight:{
                get: function(){
                    var side = getRectangleSide(comp.position);
                    switch(side){
                        case "left":
                        case "right":
                        case "inner-left":
                        case "inner-right":
                            return true;
                    }
                    return false;

                },
                configurable: true,
                enumerable: true
            },
            resizeWidth:{
                get: function(){
                    var side = getRectangleSide(comp.position);
                    switch(side){
                        case "bottom":
                        case "top":
                        case "inner-bottom":
                        case "inner-top":
                            return true;
                    }
                    return false;
                },
                configurable: true,
                enumerable: true
            }
        });
        return res;
    }
}