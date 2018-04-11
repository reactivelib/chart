/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import { CoreChart, IChartSettings } from "./basic";
import { ICanvasChildShape } from "../render/canvas/shape/index";
import { procedure } from "@reactivelib/reactive";
import {deps} from "../../config/di";

export default deps(function(settings: IChartSettings, chart: CoreChart){
    var last: ICanvasChildShape;
    var proc = procedure(p => {
        if (last){
    //        chart.addChildAt(last, chart.children.length);
        }
        last = null;
        if (settings.shape){
       //     last = renderCanvas(settings.shape);
      //      chart.addChildAt(last, chart.children.length);
        }
    });
    chart.cancels.push({
        cancel: () =>{
            proc.cancel();
            if (last){
         //       chart.removeChildAt(chart.children.array.indexOf(last));
            }
        }
    });
}, ["settings", "chart"])