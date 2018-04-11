/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

//import categorical from "../chart-xy-cat";
//import time from "../chart-xy-xSorted";
//import scatter from "../chart-xy-scatter";
//import bubble from "../chart-xy-bubble";

/*
 import {inTransaction} from "../reactive";
 //import pie from "../chart-pie";
 //import gauge from "../chart-gauge";
 //import polar from "../chart-polar";
 import {CanvasRenderer} from "../render/canvas/html";
 import procedure from "../reactive/procedure";
 import {attach, detach} from "../render/index";
 import {parseBoxModel} from "../render/html/node";
 import {collect, IStartable} from "../reactive/startable";
 //import {ICategoricalChartSettings, ICategoricalChart} from "../chart-xy-cat/chart";
 //import {IPieChartSettings} from "../chart-pie/api/chart";
 //import {IGaugeChartSettings} from "../chart-gauge/api/chart";
 //import {IPolarChartSettings} from "../chart-polar/api/chart";
 import {logError} from '../reactive';
 import {createXChart} from "./xy/sorted/x/factory";
 import {createXY2dChart} from "./xy/d2/index";
 import {createCategoricalChart} from "./xy/sorted/categorical/factory";
 import {renderTooltip} from "../render/html/tooltip/index";
 import {ARROW_SIDE} from "../geometry/layout/tooltip/side4";

 /**
 * Chart settings
 */
import {createPieChart} from "./pie/create";
import {attach, detach} from "@reactivelib/html";
import {IChartSettings} from "./core/basic";
import {create} from "../config/di";
import {ICartesianChartSettings, XYChart} from "./cartesian";
import {IPieChartSettings} from "./pie/factory";

export class ChartFactory{


    x(settings: ICartesianChartSettings){
        return new XYChart(settings);
    }

    xy(settings: ICartesianChartSettings){
        return this.x(settings);
    }

    pie(settings: IPieChartSettings){
        return createPieChart(settings);
    }

    @create
    build<E>(c: E){
        return c
    }

    createChart(config: IChartSettings){
        var chart = this.build((<any>this[config.type])(config));
        var settings = config;
        if (settings.element){
            var el = settings.element;
            if (typeof el === "string"){
                el = document.getElementById(el);
            }
            attach(el, chart);
            var oldC = chart.cancel;
            chart.cancel = function(){
                oldC.call(this);
                detach(<any>chart);
            }
        }
        settings.chart = chart;
        return chart;
    }

}