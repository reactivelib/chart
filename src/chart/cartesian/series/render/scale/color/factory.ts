/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {XYChart} from "../../../../index";
import {init, inject} from "../../../../../../config/di";
import {ColorScaleCollection} from "../../../../../render/canvas/scale/color/index";

export class CartesianColorScaleCollection extends ColorScaleCollection{

    @inject
    chart: XYChart

    @init
    init(){
        var sets = this.chart.settings.colorScales || [];
        sets.forEach(set => {
            this.add(set);
        });
    }

}