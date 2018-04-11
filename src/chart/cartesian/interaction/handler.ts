/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {deps, IContainer} from "../../../config/di";
import {ICancellable, procedure, unobserved, variable} from "@reactivelib/reactive";
import {XYChart} from "..";
import {XYChartInteraction} from "./index";

export default function handler($container: IContainer,  interaction: XYChartInteraction, chart: XYChart){
    var last: ICancellable;
    var proc = procedure(p => {
        var m = interaction.mode;
        if (last){
            last.cancel();
        }
        var mds = interaction.modes;
        for (var i=0; i < mds.length; i++){
            var mod = mds[i];
            if (mod.id === m){
                break;
            }
            mod = null;
        }        
        if (mod){
            unobserved(() => {
                last = mod.handler();
            });
            
        }
    });
    chart.cancels.push(proc);
}

deps(handler, ["$container", "interaction", "chart"]);