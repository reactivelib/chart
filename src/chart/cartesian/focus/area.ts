/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPoint} from "../../../geometry/point";
import {XYChart} from '..';
import {variable} from '@reactivelib/reactive';
import {IRectangle} from '../../../geometry/rectangle';
import {procedure} from '@reactivelib/reactive';
import {ChartCenter} from "../../core/center/index";
import {XYSeriesCollection} from "../series/collection/index";
import {TrackedFocusPoint} from "./point";
import {deps} from "../../../config/di";

function calculateFocusRectangle(pt: IPoint, cr: IRectangle) {
    if (pt.x >= cr.x && pt.x <= cr.x + cr.width){
        if (pt.y >= cr.y && pt.y <= cr.y + cr.height){
            return {
                x: pt.x,
                y: pt.y,
                width: 0,
                height: 0
            }
        };
        return {
            x: pt.x,
            y: cr.y,
            width: 0,
            height: cr.height
        }
    }
    if (pt.y >= cr.y && pt.y <= cr.y + cr.height){
        return {
            x: cr.x,
            y: pt.y,
            width: cr.width,
            height: 0
        }
    }
    return null;
}

export default function (chart: XYChart, center: ChartCenter, focusPoint: variable.IVariable<TrackedFocusPoint>){
    var rect = variable<IRectangle>(null);
    var fp = focusPoint.value;
    var p = procedure(() => {
        var pos = fp.windowPosition;
        if (!fp.suppressFocus && pos !== null){
            var cr = (<HTMLElement>center.node.element).getBoundingClientRect();
            var r = calculateFocusRectangle(pos, {
                x: cr.left, y: cr.top, width: cr.width, height: cr.height
            });
            if (!r){
                rect.value = null;
                return;
            }
            r.x -= cr.left;
            r.y -= cr.top;
            rect.value = r;
        }
        else {
            rect.value = null;
        }
    });
    chart.cancels.push(p);
    return rect;
}