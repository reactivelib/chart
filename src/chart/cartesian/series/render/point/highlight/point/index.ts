/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {AbstractSeries} from "../../../../../../series/index";
import {ICartesianPointDataHolder} from "../../../../../../data/shape/transform/cartesian/point/index";
import transformPoint from '../../../../../../render/canvas/shape/point/generate/transform';
import {animateValue} from "../../../../../../../animation/engine";
import {IPointWithRadius} from "../../../../../../render/canvas/shape/point/index";
import {CanvasContext} from "../../../../../../render/canvas/context/index";
import {IReactiveNode} from "@reactivelib/reactive";
import mixinYEnd from '../../../../../../data/shape/transform/cartesian/point/stacked/y';
import {getEndX} from "../../../../../../../datatypes/range";
import {ICartesianXPoint} from "../../../../../../../datatypes/value";
import {ISeriesShapeBase} from "../../../shape";
import {
    applyStyleToContext, ICanvasStyle, IContextModifyingShape,
    IStylable
} from "../../../../../../render/canvas/style/index";
import {IPointHighlightSettings as IPointHighlight} from "../../../../../../series/render/highlight";
import whiteStroke from "../../../../../../render/canvas/shape/point/draw/whiteStroke";
import {CartesianSeriesGroupRenderer} from "../../../group";
import {ICanvasChildShape} from "../../../../../../render/canvas/shape/index";
import {applyStyle, unapplyStyle} from "../../../../../../render/canvas/style/apply";
import makeCrisp from "../../../../../../render/canvas/shape/point/generate/crisp";
import {roundStroke} from "../../../../../../render/canvas/shape/round/index";
import {drawCirclePoint} from "../../../../../../render/canvas/shape/point/index";
import {copyClass} from "@reactivelib/core";
import {variable} from "@reactivelib/reactive";

export interface IDataHighlightPoint extends ISeriesShapeBase, IStylable{
    parent: CartesianSeriesGroupRenderer;
    radius: number;
    getPosX(data: ICartesianXPoint): number;
    getPosY(data: ICartesianXPoint): number;
    data: ICartesianPointDataHolder;
    $r: IReactiveNode;
}

export interface IShapeHoldingShape{
    shape: IContextModifyingShape;
}

export interface IParentHoldingDataHighlightPoint extends IDataHighlightPoint, IShapeHoldingShape{
    
}

export class HighlightPoint implements ICanvasChildShape{

    public parent: ICanvasChildShape;
    public style: ICanvasStyle;
    public r_radius = variable(3);

    get radius(){
        return this.r_radius.value;
    }

    set radius(v){
        this.r_radius.value = v;
    }

    constructor(public data: ICartesianXPoint){

    }

    draw(ctx: CanvasContext){
        var pt = this.generatePoint(ctx);       
        var last = applyStyle(this.style, ctx);
        drawCirclePoint(pt, ctx);                    
        applyStyleToContext(ctx, null);
        ctx.context.beginPath();
        whiteStroke(pt, ctx, drawCirclePoint);
        unapplyStyle(last, ctx);
    }

    public getPosX(data: ICartesianXPoint){
        return (data.x + getEndX(data)) / 2;
    }

    public getPosY(data: ICartesianXPoint){
        return data.y;
    }
    
    public generatePoint(ctx: CanvasContext): IPointWithRadius{
        return makeCrisp(transformPoint({
            x: this.getPosX(this.data),
            radius: this.radius,
            y: this.getPosY(this.data)
        }, ctx.transform), roundStroke);
    }

}

export interface IPointHighlightClassSettings{
    yEnd?: boolean;
}
export function initShape(shape: HighlightPoint, styleSettings: IPointHighlight){
    var r = 3;
    if (styleSettings.radius){
        r = styleSettings.radius;
    }
    if (styleSettings.style){
        shape.style = styleSettings.style;
    }
    shape.radius = 0;
    animateValue({
        duration: 200,
        value: 0,
        end: r,
        set: (v) => {
            shape.radius = v;
        }
    });
}

export default function(settings: IPointHighlightClassSettings, styleSettings: IPointHighlight){
    var cl = HighlightPoint;
    if (settings.yEnd){
        cl = copyClass(HighlightPoint);
        cl = mixinYEnd(cl);
    }
    return function(data: ICartesianXPoint, series: AbstractSeries){
        var shape = new cl(data);
        initShape(shape, styleSettings);
        return shape;
    }
}