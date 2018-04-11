/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IAxisCollection} from "../axis/collection/index";
import {IAxisLabelComponentSettings} from "../label/component";
import { XYAxisSystem } from "../axis";
import { extend } from "@reactivelib/core";
import { ILabelStyle } from "../../render/canvas/label/cache/index";
import { ILabelComponentConfig } from "../../component/label";
import {ComponentPosition, IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative";

function insertLabel(pos: ComponentPosition, layout: IRelativePositionedGridElement[], axis: XYAxisSystem){
    var lbl = axis.settings.label;
    if (lbl){
        if (typeof lbl === "string"){
            lbl = {
                text: lbl
            }
        }
        var style = <ILabelStyle>extend({}, lbl.style);
        if (pos === "left" || pos === "right"){
            if (!style.rotate){
                style.rotate = -Math.PI / 2;
            }            
        }
        layout.push({
            position: pos,
            component: <ILabelComponentConfig>{
                type: "label",
                style: style,
                text: lbl.text
            }
        })
    }
}

export function axisLabelsLayout(viewports: IAxisCollection, pos: ComponentPosition, opos: ComponentPosition){
    var layout: IRelativePositionedGridElement[] = [];
    var opposite = false;
    var p = opposite ? opos : pos;
    layout.push({
        position: p,
        component: <IAxisLabelComponentSettings>{
            type: "axis-labels",
            axis: viewports.primary.id
        }
    });
    insertLabel(p, layout, <XYAxisSystem>viewports.primary);
    opposite = !opposite;
    viewports.secondary.forEach(a => {
        var p = opposite ? opos : pos;
        layout.push({
            position: p,
            component: <IAxisLabelComponentSettings>{
                type: "axis-labels",
                axis: a.id
            }
        });
        opposite = !opposite;
        insertLabel(p, layout, <XYAxisSystem>a);
    });
    return layout;
}