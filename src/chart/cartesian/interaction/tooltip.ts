/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IMovementPlugin} from "../../render/html/interaction/move/move";
import {IXYChartSystem} from "../index";
import {XYFocus} from "../focus/index";
import {IUnifiedEvent} from "../../render/html/event/unified";

export class TooltipSuppressionMovementPlugin implements IMovementPlugin{


    constructor(public plugin: IMovementPlugin, public chart: IXYChartSystem){

    }

    public start(point: IUnifiedEvent){
        (<XYFocus>this.chart.focus).focusPoint.suppressFocus = true;
        this.plugin.start(point);
    }

    public moveTo(point: IUnifiedEvent){
        this.plugin.moveTo(point);
    }

    public stop(point: IUnifiedEvent){
        (<XYFocus>this.chart.focus).focusPoint.suppressFocus = false;
        this.plugin.stop(point);
    }
}