/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../../../../render/canvas/context/index";
import {ICandlestick} from "../../../../../datatypes/candlestick";
import {getEndX} from "../../../../../datatypes/range";
import {applyStyleToContext} from "../../../../render/canvas/style/index";
import {applyStyle, unapplyStyle} from "../../../../render/canvas/style/apply";
import {AbstractSeriesShapeBase} from "../shape";
import {CartesianSeriesGroupRenderer} from "../group";
import {IXYSeriesSystem} from "../../series";
import {ICanvasChildShape} from "../../../../render/canvas/shape/index";
import {IShapeDataHolder} from "../../../../data/shape/transform/index";
import {ISeriesShape} from "../../../../series/render/base";
import {IRectangle} from "../../../../../geometry/rectangle/index";
import {ICandleWithMiddle} from "../../../../render/canvas/shape/candle/index";
import {drawCandleWithMiddle, getCandleBoundingBox} from "../../../../render/canvas/shape/candle/index";
import drawWithWhiteStroke from "../../../../render/canvas/shape/candle/draw/whiteStroke";
import {IColorScale} from "../../../../render/canvas/scale/color/index";
import {applyColorScale, unapplyColorScale} from "../../../../render/canvas/scale/color/shape";
import {IColorable} from "../../../../../datatypes/color";
import {makeCandleCrisp} from "../../../../render/canvas/shape/candle/generate/crisp";
import transformCandle from "../../../../render/canvas/shape/candle/generate/transform";
import {CandleShapeRenderer} from "./factory";

export function generateSeriesCandle(data: ICandlestick){    
    var middle = (data.x + getEndX(data)) / 2;
    return {
        middle: middle,
        x: data.x,
        xe: getEndX(data),
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
    }
}

export function applyWithColorScale(this: CandlestickSeriesShape, ctx: CanvasContext){
    var st = applyStyle(this.style, ctx);
    var cs = applyColorScale(<IColorable>this.data, this.colorScale, ctx);
    return {
        style: st,
        colorScale: cs
    }
}

export function unapplyWithColorScale(this: CandlestickSeriesShape, last: any, ctx: CanvasContext){
    unapplyColorScale(last.colorScale, ctx);
    unapplyStyle(last.style, ctx);
}

export class CandlestickSeriesShape extends AbstractSeriesShapeBase{

    public colorScale: IColorScale;

    constructor(public data: ICandlestick, public parent: CandleShapeRenderer){
        super(data, parent);
    }

    getScreenBoundingBox(): IRectangle{
        return this._bb || {x: 0, y: 0, width: 0, height: 0};
    }

    public generateCandle(ctx: CanvasContext): ICandleWithMiddle{
        var c = makeCandleCrisp(transformCandle(generateSeriesCandle(this.data), ctx.transform), this.parent.round);
        return c;
    }

    public lastStyle: any;

    public applyStyle(ctx: CanvasContext){
        return applyStyle(this.style, ctx);
    }

    public unapplyStyle(last: any, ctx: CanvasContext){
        unapplyStyle(last, ctx);
    }

    public draw(ctx: CanvasContext){
        var candle = this.generateCandle(ctx);
        this._bb = getCandleBoundingBox(candle, ctx);
        var last = this.applyStyle(ctx);
        drawCandleWithMiddle(ctx, candle);
        applyStyleToContext(ctx, this._bb);
        ctx.context.beginPath();
        this.unapplyStyle(last, ctx);
    }

    createHighlighter(){
        return new CandleHighlightingShape(this);
    }
}

export function drawStroke(this: CandlestickSeriesShape, ctx: CanvasContext){
    var candle = this.generateCandle(ctx);
    this._bb = getCandleBoundingBox(candle, ctx);
    var last = this.applyStyle(ctx);
    drawCandleWithMiddle(ctx, candle);
    ctx.context.stroke();
    ctx.context.beginPath();
    this.unapplyStyle(last, ctx);
}

export class CandleHighlightingShape implements ICanvasChildShape{

    public parent: ICanvasChildShape;

    constructor(public shape: CandlestickSeriesShape){

    }

    public draw(ctx: CanvasContext){
        var last = this.shape.applyStyle(ctx);
        var rect = this.shape.generateCandle(ctx);
        applyStyleToContext(ctx, this.shape._bb);
        drawCandleWithMiddle(ctx, rect);
        drawWithWhiteStroke(rect, ctx);
        this.shape.unapplyStyle(last, ctx);
    }
}