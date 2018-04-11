/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CoreChart, IChartSettings} from "../basic";
import {procedure} from "@reactivelib/reactive";
import {ICanvasShapeOrConfig} from "../../render/canvas/shape/create";
import {ChartCenter} from "./index";
import {deps} from "../../../config/di";

export default function (chart: CoreChart, center: ChartCenter, chartSettings: IChartSettings) {
    var last: ICanvasShapeOrConfig;
    var proc = procedure(p => {
        if (last){
            center.getLayer(10).getCanvas().child.remove(center.getLayer(10).getCanvas().child.indexOf(last));
        }
        last = null;
        if (chartSettings.center && chartSettings.center.shape){
            last = chartSettings.center.shape;
            center.getLayer(10).getCanvas().child.push(last);
        }
    });
    chart.cancels.push({
        cancel: () =>{
            proc.cancel();
            if (last){
                center.getLayer(10).getCanvas().child.remove(center.getLayer(10).getCanvas().child.indexOf(last));
            }
        }
    });
}