/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../../../../render/canvas/context/index";
import {applyStyleToContext} from "../../../../render/canvas/style/index";
import {ICartesianPointDataHolder} from "../../../../data/shape/transform/cartesian/point/index";
import {getEndX, getEndY} from "../../../../../datatypes/range";
import {ICanvasChildShape} from "../../../../render/canvas/shape/index";
import {AbstractSeriesShapeBase} from "../shape";
import {drawCirclePoint, IPointWithRadius} from "../../../../render/canvas/shape/point/index";
import makePointCrisp from "../../../../render/canvas/shape/point/generate/crisp";
import drawWithWhiteStroke from "../../../../render/canvas/shape/point/draw/whiteStroke";
import transformPoint from "../../../../render/canvas/shape/point/generate/transform";
import {IColorScale} from "../../../../render/canvas/scale/color/index";
import {IRadiusScale} from "../../../../render/canvas/scale/radius/index";
import {applyStyle, unapplyStyle} from "../../../../render/canvas/style/apply";
import {applyColorScale, unapplyColorScale} from "../../../../render/canvas/scale/color/shape";

export function getYForStack(n: ICartesianPointDataHolder){
    return n.ye;
}

export class SeriesPointShape extends AbstractSeriesShapeBase{

    public radius: number;
    public data: ICartesianPointDataHolder;    

    public getY(n: ICartesianPointDataHolder){
        return (n.y + getEndY(n)) / 2;
    }

    public generateRawPoint(){
        var n = this.data;
        var r = this.radius;
        if (this.radiusScale){
            r = this.radiusScale.getRadius(this.data.data.r);
        }
        return {
            x: (n.x + getEndX(n)) / 2,
            y: this.getY(n),
            radius: r
        }
    }

    public generatePoint(ctx: CanvasContext){        
        return makePointCrisp(transformPoint(this.generateRawPoint(), ctx.transform), this.parent.round);
    }

    public colorScale: IColorScale;
    public radiusScale: IRadiusScale;
    
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
        var pt = this.generatePoint(ctx);
        var r = pt.radius;
        this._bb = {
            x: pt.x - r,
            y: pt.y - r,
            width: r * 2,
            height: r * 2
        }
        var last = this.applyStyle(ctx);
        this.drawPoint(ctx, pt);
        applyStyleToContext(ctx, this._bb);
        ctx.context.beginPath();
        this.unapplyStyle(last, ctx);
    }

    public drawPoint(ctx: CanvasContext, rect: IPointWithRadius){
        drawCirclePoint(rect, ctx);
    }

    public createHighlighter(){
        return new PointHighlightingShape(this);
    }

}

SeriesPointShape.prototype.radius = 4;

export class PointHighlightingShape implements ICanvasChildShape{

    public parent: ICanvasChildShape;

    constructor(public shape: SeriesPointShape){

    }

    public draw(ctx: CanvasContext){
        var last = this.shape.applyStyle(ctx);
        var pt = this.shape.generatePoint(ctx);
        applyStyleToContext(ctx, this.shape._bb);
        drawCirclePoint(pt, ctx);
        drawWithWhiteStroke(pt, ctx, drawCirclePoint);
        this.shape.unapplyStyle(last, ctx);
    }
}