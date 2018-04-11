/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IDonutShapeConfig} from '../../../../../../render/canvas/shape/doughnut/index';
import {ICartesianXPoint} from "../../../../../../../datatypes/value";
import {IPointHighlightClassSettings} from "../point/index";
import {getEndX} from "../../../../../../../datatypes/range";
import mixinYEnd from '../../../../../../data/shape/transform/cartesian/point/stacked/y';
import {IDonutHighlightSettings} from "../../../../../../series/render/highlight";
import {AbstractSeries} from "../../../../../../series/index";
import {animateValue} from "../../../../../../../animation/engine";
import { DonutRenderer } from "../../../../../../render/canvas/shape/doughnut/index";
import { variable } from '@reactivelib/reactive';
import { node } from '@reactivelib/reactive';
import { CanvasContext } from '../../../../../../render/canvas/context/index';

class DounutSettings implements IDonutShapeConfig{
    public endRadius: number;
    public startRadius: number;
    public x: number;
    public y: number;
}

DounutSettings.prototype.endRadius = 8;
DounutSettings.prototype.startRadius = 4;

export class DataDonutHighlighter extends DonutRenderer{

    public $r = node();

    constructor(public data: ICartesianXPoint){
        super(new DounutSettings());
    }

    public getPosX(data: ICartesianXPoint){
        return (data.x + getEndX(data)) / 2;
    }
    
    
    public getPosY(data: ICartesianXPoint){
        return data.y;
    }
    
    get x(){
        return this.getPosX(this.data);
    }
    
    get y(){
        return this.getPosY(this.data);
    }
    
    draw(ctx: CanvasContext){
        super.draw(ctx);
        this.$r.observed();
    }
    
}

class YEndDataDonutHighlighter extends DataDonutHighlighter{
    
}

mixinYEnd(YEndDataDonutHighlighter);

export default function createDonutDataHighlighter(settings: IPointHighlightClassSettings, styleSettings: IDonutHighlightSettings) {
    var highlighter: new (data: ICartesianXPoint) => DataDonutHighlighter = DataDonutHighlighter;
    if (settings.yEnd){
        highlighter = YEndDataDonutHighlighter;
    }
    return function(data: ICartesianXPoint, series: AbstractSeries){
        var shape = new highlighter(data);
        if (styleSettings.startRadius){
            shape.settings.startRadius = styleSettings.startRadius;
        }
        shape.endRadius = shape.settings.startRadius;
        var r = 8;
        if (styleSettings.endRadius){
            r = styleSettings.endRadius;
        }
        if (styleSettings.style){
            shape.settings.style = styleSettings.style;
        }
        animateValue({
            duration: 200,
            value: shape.settings.startRadius,
            end: r,
            set: (v: number) => {
                shape.settings.endRadius = v;
                shape.$r.changedDirty();
            }
        });
        return shape;
    }
    
}
