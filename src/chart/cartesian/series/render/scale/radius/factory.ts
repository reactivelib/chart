/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {create, define, deps, init, inject} from "../../../../../../config/di";
import {ICartesianChartSettings, XYChart} from "../../../../index";
import {
    IRadiusScale, IRadiusScaleSettings,
    RadiusScaleCollection
} from "../../../../../render/canvas/scale/radius/index";
import {createAutoRadiusScale} from "../../../../../render/canvas/scale/radius/auto";

function createScale(settings: IRadiusScaleSettings){
    switch(settings.type || "auto"){
        case "auto":
            return createAutoRadiusScale(settings);
        default:
            throw new Error("Unknown radius scale "+settings.type);
    }
}

export class CartesianRadiusScaleCollection extends RadiusScaleCollection{

    @inject
    chart: XYChart

    @define
    factory = createScale

    @init
    init(){
        var sets = this.chart.settings.radiusScales || [];
        sets.forEach(set => {
            this.add(set);
        });
    }
}