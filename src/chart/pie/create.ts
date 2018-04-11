/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {assemble, join, ObjectContainer} from "../../config/di";
import {transaction} from "@reactivelib/reactive";
import {IPieChartSettings} from "./factory";
import {PieChart} from "./index";

export function createPieChart(settings: IPieChartSettings){
    var res = transaction(() => {
        try{
            var chart = new PieChart(settings);
            assemble({
                instance: chart
            });
            var cancel = chart.starter.start();            
            chart.cancels.push(cancel);
            return chart;
        }
        catch (err){
            chart.cancel();
            throw err;
        }
    });
    return res;
}