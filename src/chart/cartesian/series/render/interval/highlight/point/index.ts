/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {AbstractSeries} from "../../../../../../series/index";
import {animateValue} from "../../../../../../../animation/engine";
import mixinYEnd from '../../../../../../data/shape/transform/cartesian/point/stacked/y';
import {
    initConstantGroup, RenderOnlyConstantGroup, ProxyGroup, ConstantProxyGroup,
} from '../../../../../../render/canvas/shape/group/index';
import {copyClass} from "@reactivelib/core";
import {iterable} from "../../../../../../../collection/iterator/array";
import {IIterable} from "../../../../../../../collection/iterator/index";
import {ICanvasChildShape} from "../../../../../../render/canvas/shape/index";
import {HighlightPoint} from '../../../point/highlight/point';
import {ICartesianXPoint} from "../../../../../../../datatypes/value";
import {IStylable, ICanvasStyle} from "../../../../../../render/canvas/style/index";
import {IPointHighlightSettings} from "../../../../../../series/render/highlight";
import { CanvasContext } from "../../../../../../render/canvas/context/index";
import { drawByStyle } from "../../../../../../render/canvas/style/apply";

const HighlightYEnd = mixinYEnd(copyClass(HighlightPoint));

export class Group extends RenderOnlyConstantGroup{

    public style: ICanvasStyle;

    draw(ctx: CanvasContext){
        drawByStyle(this, ctx, () => {
            super.draw(ctx);
        });
    }

}

export default function(){
    return function(data: ICartesianXPoint, series: AbstractSeries, settings: IPointHighlightSettings){
        var shape1 = new HighlightPoint(data);
        var shape2 = new HighlightYEnd(data);
        var r = 5;
        if (settings.radius){
            r = settings.radius;
        }
        if (settings.style){
            shape1.style = settings.style;
            shape2.style = settings.style;
        }
        animateValue({
            duration: 200,
            value: 0,
            end: r,
            set: (v) => {
                shape1.radius = v;
                shape2.radius = v;
            }
        });
        return new Group(iterable([shape1, shape2]));
    }
}
