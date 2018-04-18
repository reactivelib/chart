/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../../../../../render/canvas/context/index";
import {IPointRectangle, IRectangle} from "../../../../../../geometry/rectangle/index";
import {ISeriesShape} from "../../../../../series/render/base";
import {applyStyleToContext, IStylable} from "../../../../../render/canvas/style/index";
import {ICanvasChildShape} from "../../../../../render/canvas/shape/index";
import {ICartesianPointDataHolder} from "../../../../../data/shape/transform/cartesian/point/index";
import {ICartesianXPoint} from "../../../../../../datatypes/value";
import {ColumnShapeRenderer} from "./group";
import {AbstractSeriesShapeBase} from "../../shape";
import {makeRectangleCrisp} from "../../../../../render/canvas/shape/rectangle/generate/crisp";
import {transformRectangle} from "../../../../../render/canvas/shape/rectangle/generate/transform";
import {IColorScale} from "../../../../../render/canvas/scale/color/index";
import {applyColorScale, unapplyColorScale} from "../../../../../render/canvas/scale/color/shape";
import {applyStyle, unapplyStyle} from "../../../../../render/canvas/style/apply";
import {drawPointRectangle, getRectangleBoundingBox} from "../../../../../render/canvas/shape/rectangle/index";
import {drawCirclePoint} from "../../../../../render/canvas/shape/point/index";
import transformPoint from "../../../../../render/canvas/shape/point/generate/transform";
import drawPointWithWhiteStroke from "../../../../../render/canvas/shape/point/draw/whiteStroke";
import {getEndX} from "../../../../../../datatypes/range";
import animateObject from "../../../../../../animation/object";
import {node} from "@reactivelib/reactive";

export interface IColumnSeriesShape extends ISeriesShape, ICanvasChildShape, IStylable{
    parent: ColumnShapeRenderer;
    data: ICartesianPointDataHolder;
    _bb: IRectangle;
    getEndX(s: ICartesianXPoint) :number;
    getStartX(s: ICartesianXPoint): number;
}

export class ColumnSeriesShape extends AbstractSeriesShapeBase implements IColumnSeriesShape{

    public parent: ColumnShapeRenderer;

    public getEndX(s: ICartesianXPoint){
        return getEndX(s);
    }

    getStartX(s: ICartesianXPoint){
        return s.x;
    }

    public generateRectangle(ctx: CanvasContext){        
        return makeRectangleCrisp(transformRectangle(this.generateRawRectangle(ctx), ctx.transform), this.parent.round);
    }

    public generateRawRectangle(ctx: CanvasContext){
        var n = this.data;
        var origin = this.parent.start;
        var y = Math.min(n.y, origin);
        return {
            xs: this.getStartX(n),
            ys: y,
            xe: this.getEndX(n),
            ye: Math.max(n.y, origin)
        };
    }

    public colorScale: IColorScale;
    
    public applyStyle(ctx: CanvasContext){        
        var st = applyStyle(this.style, ctx);        
        if (this.colorScale){
            var cs = applyColorScale(this.data, this.colorScale, ctx);
        }
        return {
            style: st,
            colorScale: cs
        }
    }

    public unapplyStyle(last: any, ctx: CanvasContext){                
        if (this.colorScale){
            unapplyColorScale(last.colorScale, ctx);
        }
        unapplyStyle(last.style, ctx);
    }

    public draw(ctx: CanvasContext){
        var rect = this.generateRectangle(ctx);
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

    createHighlighter(): ICanvasChildShape{
        return new ColumnHighlightPoint(this);
    }

}

export class ColumnHighlightPoint implements ICanvasChildShape{

    public parent: ICanvasChildShape;
    public radius = 0;
    public $r = node();

    constructor(public shape: ColumnSeriesShape){
        animateObject({
            from: this,
            to: {
                radius: 4
            },
            duration: 200,
            onUpdate: () => {
                this.$r.changedDirty();
            }
        });
    }

    draw(ctx: CanvasContext){
        this.$r.observed();
        var st = this.shape.applyStyle(ctx);
        var rr = this.shape.generateRawRectangle(ctx);
        var x = (this.shape.data.x + getEndX(this.shape.data)) / 2;
        var y = this.getY(rr);
        var pt = transformPoint({
            x: x, y: y, radius: this.radius
        }, ctx.transform);
        drawCirclePoint(pt, ctx);
        applyStyleToContext(ctx, null);
        ctx.context.beginPath();
        drawPointWithWhiteStroke(pt, ctx, drawCirclePoint);
        this.shape.unapplyStyle(st, ctx);
    }

    public getY(rect: IPointRectangle){
        return rect.ye;
    }

}

export function generateRectangleForStack(this: IColumnSeriesShape, ctx: CanvasContext): IPointRectangle{
    var n = this.data;
    return {
        xs: this.getStartX(n),
        ys: n.y,
        xe: this.getEndX(n),
        ye: n.ye
    }
}