/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import { ICancellable } from "@reactivelib/reactive";
import { procedure } from "@reactivelib/reactive";
import { ChartAxisLabels } from "./index";
import { AxisCollection } from "../axis/collection";
import { variable } from "@reactivelib/reactive";
import {getRectangleSide} from "../../../geometry/layout/rectangle/incremental/side";

function add(axes: AxisCollection, labels: ChartAxisLabels){
    axes.axisLabels.push(labels);
    return {
        cancel: () => {
            axes.axisLabels.remove(axes.axisLabels.array.indexOf(labels));
        }
    }
}

export default function(labels: ChartAxisLabels, yAxes: variable.IVariable<AxisCollection>, xAxes: variable.IVariable<AxisCollection>){
    var lastCancel: ICancellable;
    var p = procedure(p => {
        lastCancel && lastCancel.cancel();
        var side = getRectangleSide(labels.side);
        switch(side){
            case "left":
            case "right":
            case "inner-right":
            case "inner-left":
                switch (yAxes.value.origin){
                    case "left":
                    case "right":
                        lastCancel = add(xAxes.value, labels);
                        break;
                    default:
                        lastCancel = add(yAxes.value, labels);
                        break;
                }

                break;
            case "top":
            case "bottom":
            case "inner-top":
            case "inner-bottom":
                switch (yAxes.value.origin){
                    case "left":
                    case "right":
                        lastCancel = add(yAxes.value, labels);
                        break;
                    default:
                        lastCancel = add(xAxes.value, labels);
                        break;
                }
                break;
        }
    }); 
    return {
        cancel: () => {
            p.cancel();
            lastCancel.cancel();
        }
    }
}