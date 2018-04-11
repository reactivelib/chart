/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ChartGrid} from "../factory";
import {XYChart} from "../../../cartesian/index";
import {create, define} from "../../../../config/di/index";
import {AxisCollection} from "../../../cartesian/axis/collection/index";
import {LegendComponentFactory} from "../../../cartesian/component/legend";
import {SpaceComponentFactory} from "../../../component/space";
import {LabelComponentFactory} from "../../../component/label";
import {TitleComponentFactory} from "../../../component/title";
import {AxisLabelGridComponentFactory} from "../../../cartesian/label/component";
import {XYToolBarComponent} from "../../../cartesian/component/toolbar";
import {SubtitleComponentFactory} from "../../../component/title/subtitle";


export var xyGridFactories: any[] = [LegendComponentFactory, AxisLabelGridComponentFactory,
    SpaceComponentFactory, LabelComponentFactory, TitleComponentFactory, SubtitleComponentFactory, XYToolBarComponent];


export class CartesianChartGrid extends ChartGrid{

    chart: XYChart

    @define
    factories = xyGridFactories

    @define
    afterLayout = []

    @create(function(this: CartesianChartGrid){
        var chart = this.chart
        return [() => {
            if (!chart.xAxesExternal){
                (<AxisCollection>chart.xAxes).synchronize();
            }
            if (!chart.yAxesExternal){
                (<AxisCollection>chart.yAxes).synchronize();
            }
        }]
    })
    afterResize

}