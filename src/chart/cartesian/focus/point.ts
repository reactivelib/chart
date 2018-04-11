/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {variable} from "@reactivelib/reactive";
import {IPoint} from "../../../geometry/point";
import {ICartesianChartSettings, XYChart} from "..";
import {XYFocus} from "./index";
import {ISeriesShape} from "../../series/render/base";
import {ChartCenter} from "../../core/center/index";
import {findCanvasShape} from "../../render/canvas/html/util";
import {selectedNode} from "../../render/canvas/html/event";
import {ICanvasChildShape} from "../../render/canvas/shape/index";
import {XYAreaSystem} from "../area";
import {deps} from "../../../config/di";

export class TrackedFocusPoint {
    
    private r_windowPosition = variable<IPoint>(null);
    public r_target = variable<ISeriesShape>(null);

    constructor(public focus: XYFocus){

    }

    get target(){
        return this.r_target.value;
    }
    set target(v){
        this.r_target.value = v;
    }
    
    get windowPosition(){
        return this.r_windowPosition.value;
    }
    
    set windowPosition(v){
        this.r_windowPosition.value = v;
    }

    public r_suppressFocus = variable<boolean>(false);

    get suppressFocus(){
        return this.r_suppressFocus.value;
    }

    set suppressFocus(v){
        this.r_suppressFocus.value = v;
    }        
}

export default function(focus: XYFocus, masterFocus: variable.IVariable<XYFocus>, settings: ICartesianChartSettings, center: ChartCenter, chart: XYChart){
    var res = variable<TrackedFocusPoint>(null).listener(v => {
        v.value = (masterFocus.value && masterFocus.value.focusPoint) || new TrackedFocusPoint(focus);
    });
    var target: ISeriesShape;
    center.events.add({
        move: (ev) => {
            target = null;
            res.value.windowPosition = {
                x: ev.clientX,
                y: ev.clientY
            }
            var cr = center.calculateBoundingBox();
            var relativePosition = {
                x: ev.clientX - cr.left,
                y: ev.clientY - cr.top
            }
            var selected = selectedNode(findCanvasShape((<XYAreaSystem>chart.viewports.primary).seriesCanvasGroup.node).find(relativePosition));
            if (selected){
                var t = <ISeriesShape & ICanvasChildShape>selected.shape;
                if ("data" in t && "getScreenBoundingBox" in t){
                    target = <ISeriesShape>t;
                    res.value.target = t;
                }
                else {
                    res.value.target = null;
                }
            }
        },
        leave: () => {
            res.value.windowPosition = null;
            res.value.target = null;
        }
    });
    return res;
}