/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../../../../render/canvas/context/index";
import {ICartesianSeriesShapeSettings} from "../../series";
import {IPointRectangle} from "../../../../../geometry/rectangle/index";
import {CartesianSeriesGroupRenderer,} from "../group";
import {applyStyleToContext, IStylable} from "../../../../render/canvas/style/index";
import {ICartesianPointDataHolder} from "../../../../data/shape/transform/cartesian/point/index";
import {AbstractSeriesShapeBase} from "../shape";
import {ICanvasChildShape} from "../../../../render/canvas/shape/index";
import {transformRectangle} from "../../../../render/canvas/shape/rectangle/generate/transform";
import {makeRectangleCrisp} from "../../../../render/canvas/shape/rectangle/generate/crisp";
import {drawRectangleWithWhiteStroke} from "../../../../render/canvas/shape/rectangle/draw/whiteStroke";
import {IColorScale} from "../../../../render/canvas/scale/color/index";
import {applyColorScale, unapplyColorScale} from "../../../../render/canvas/scale/color/shape";
import {drawByStyle} from "../../../../render/canvas/style/apply";
import {drawPointRectangle, getRectangleBoundingBox} from "../../../../render/canvas/shape/rectangle/index";
import {roundFillOrStroke} from "../../../../render/canvas/shape/round/strokeFill";
import {ISeriesShape} from "../../../../series/render/base";

/**
 * @editor
 */
export interface IDiscreteShapeSettings extends ICartesianSeriesShapeSettings{
    
    type: "discrete";
    square?: boolean;
    roundedCorner?: boolean;
}

export class CategoricalShape extends AbstractSeriesShapeBase{

    public prepared: IPointRectangle;
    
    constructor(public data: ICartesianPointDataHolder, public parent: NormalCartesianCategorySeriesGroupRenderer){
        super(data, parent);
    }    
    
    public generateRectangle(ctx: CanvasContext){
        var n = this.data;
        return makeRectangleCrisp(transformRectangle({
            xs: n.x,
            xe: n.xe,
            ys: n.y,
            ye: n.ye
        }, ctx.transform), this.round);
    }

    get round(){
        return this.parent.round;
    }

    public colorScale: IColorScale;
    
    public applyStyle(ctx: CanvasContext){            
        if (this.colorScale){
            var cs = applyColorScale(this.data, this.colorScale, ctx);
        }
        return {
            colorScale: cs
        }
    }

    public unapplyStyle(last: any, ctx: CanvasContext){                
        if (this.colorScale){
            unapplyColorScale(last.colorScale, ctx);
        }
    }

    public draw(ctx: CanvasContext){
        var rect = this.prepared;
        this._bb = getRectangleBoundingBox(rect, ctx);
        var last = this.applyStyle(ctx);
        this.drawRectangle(ctx, rect);
        applyStyleToContext(ctx, this._bb);
        ctx.context.beginPath();
        this.unapplyStyle(last, ctx);
    }

    public drawRectangle(ctx: CanvasContext, rect: IPointRectangle){
        drawPointRectangle(ctx, rect);
    }

    public createHighlighter(){
        return new CategoryHighlightingShape(this);
    }

}

export class SquareCategoricalShape extends CategoricalShape{

    public add: number;
    public mx: number;
    public my: number;
    public groupAdd: number;

    public generateRectangle(ctx: CanvasContext){
        var oldRect = super.generateRectangle(ctx);
        var width = oldRect.xe - oldRect.xs;
        var height = oldRect.ye - oldRect.ys;
        var add = this.round(Math.min((oldRect.xe - oldRect.xs) / 2, (oldRect.ye - oldRect.ys) / 2));
        var mx = this.round(oldRect.xs + width / 2);
        var my = this.round(oldRect.ys + height / 2);
        this.add = add;
        this.mx = mx;
        this.my = my;
        return oldRect;
    }

}

export class NormalCartesianCategorySeriesGroupRenderer extends CartesianSeriesGroupRenderer{
    public draw(ctx: CanvasContext){
        drawByStyle(<IStylable><any>this, ctx, () => {
            this.round = roundFillOrStroke(ctx);
            var l = this.shapes.length;
            for (var i=0; i < l; i++){
                var s = <CategoricalShape>this.shapes.get(i);
                s.prepared = s.generateRectangle(ctx);
                s.draw(ctx);
            }
        });        
    }

    create(parent: ICanvasChildShape, sd: ICartesianPointDataHolder): ISeriesShape & ICanvasChildShape{
        return new CategoricalShape(sd, this);
    }

}

export class SquareCartesianCategorySeriesGroupRenderer extends CartesianSeriesGroupRenderer{
    public draw(ctx: CanvasContext){
        drawByStyle(<IStylable><any>this, ctx, () => {
            this.round = roundFillOrStroke(ctx);
            var l = this.shapes.length;
            var add = Number.MAX_VALUE;
            for (var i=0; i < l; i++){
                var s = <SquareCategoricalShape>this.shapes.get(i);
                s.prepared = s.generateRectangle(ctx);
                add = Math.min(add, s.add);
            }
            add = this.round(add);
            for (var i=0; i < l; i++){
                var s = <SquareCategoricalShape>this.shapes.get(i);
                var p = s.prepared;
                s.groupAdd = add;
                p.xs = s.mx - add;
                p.xe = s.mx + add;
                p.ys = s.my - add;
                p.ye = s.my + add;
                s.draw(ctx);
            }
        });        
    }

    create(parent: ICanvasChildShape, sd: ICartesianPointDataHolder): ISeriesShape & ICanvasChildShape{
        return new SquareCategoricalShape(sd, this);
    }
}

export function createCategoricalShapeRenderer(square: boolean){
    
    if (square){
        return SquareCartesianCategorySeriesGroupRenderer;
    }
    else
    {
        return NormalCartesianCategorySeriesGroupRenderer;
    }
}

export class CategoryHighlightingShape implements ICanvasChildShape{

    public parent: ICanvasChildShape;

    constructor(public shape: CategoricalShape){

    }

    public draw(ctx: CanvasContext){
        var last = this.shape.applyStyle(ctx);
        var rect = this.shape.prepared;
        applyStyleToContext(ctx, this.shape._bb);
        this.shape.drawRectangle(ctx, rect);
        drawRectangleWithWhiteStroke(rect, ctx, this.shape.drawRectangle);
        this.shape.unapplyStyle(last, ctx);

    }
}