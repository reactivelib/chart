/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointRectangle} from "../../../geometry/rectangle/index";
import {create, deps, inject} from "../../../config/di";
import {IAxisCollection} from "../axis/collection/index";
import {ICartesianChartSettings, XYChart} from "../index";
import {ConstrainedDomainChanger} from "../../../math/domain/constrain";
import {variable} from "@reactivelib/reactive";

class DomainChangerRect implements IPointRectangle{
    constructor(public xAxes: variable.IVariable<IAxisCollection>, public yAxes: variable.IVariable<IAxisCollection>){

    }

    get xs(){
        return this.xAxes.value.maxWindow.start;
    }

    get xe(){
        return this.xAxes.value.maxWindow.end;
    }

    get ys(){
        return this.yAxes.value.maxWindow.start;
    }

    get ye(){
        return this.yAxes.value.maxWindow.end;
    }
}

export class DomainChangeContext{

    @inject
    chart: XYChart

    @create(function(this: DomainChangeContext){
        var changer = new ConstrainedDomainChanger(this.chart.window, new DomainChangerRect(this.chart.r_xAxes, this.chart.r_yAxes));
        if (this.chart.settings.interaction && "constrain" in this.chart.settings.interaction && !this.chart.settings.interaction.constrain){
            changer.maxWindow = {
                xs: -Number.MAX_VALUE,
                xe: Number.MAX_VALUE,
                ys: -Number.MAX_VALUE,
                ye: Number.MAX_VALUE
            }
        }
        return changer;
    })
    domainChanger: ConstrainedDomainChanger

}