/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {SpaceComponentFactory} from "../component/space";
import {ChartGrid} from "../core/layout/factory";
import {create, define, inject} from "../../config/di";
import {PieChartLabelLayouter} from "./label";
import {LabelComponentFactory} from "../component/label";
import {TitleComponentFactory} from "../component/title";
import {SubtitleComponentFactory} from "../component/title/subtitle";

export var pieGridFactories: any[] = [LabelComponentFactory, SpaceComponentFactory, TitleComponentFactory, SubtitleComponentFactory];

export class PieChartGrid extends ChartGrid{

    @inject
    seriesManager: () => void
    @inject
    label: PieChartLabelLayouter

    @define
    factories = pieGridFactories;
    @define
    afterLayout = []

    @create(function(this: PieChartGrid){
        return [this.seriesManager];
    })
    afterResize

}