/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../shape/index";
import {CanvasContext, ILinearGradient} from "../context/index";
import {applyStyleToContext} from "./draw";
import {IRectangle} from "../../../../geometry/rectangle/index";
import {applyStyle, unapplyStyle} from './apply';

export interface ICanvasStyle{
    fillStyle?: string | ILinearGradient;
    font?: string;
    globalAlpha?: number;
    globalCompositeOperation?: string;
    imageSmoothingEnabled?: boolean;
    lineCap?: string;
    lineDash?: number[];
    lineDashOffset?: number;
    lineJoin?: string;
    lineWidth?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    strokeStyle?: string | ILinearGradient;
    textAlign?: string;
    textBaseline?: string;
    cursor?: string;
}

export interface IAppliedCanvasStyle extends ICanvasStyle{

    applyFill(ctx: CanvasContext, bb: IRectangle): void;
    applyStroke(ctx: CanvasContext, bb: IRectangle): void;

}

/**
 * A shape that can be styled
 */
export interface IStylable extends ICanvasChildShape{
    /**
     * The main style
     */
    style: ICanvasStyle;
}

export interface IContextModifyingShape{
    applyStyle(ctx: CanvasContext): any;
    unapplyStyle(last: any, ctx: CanvasContext): void;
}

export function pushStyle(ctx: CanvasRenderingContext2D, style: ICanvasStyle): ICanvasStyle{
    var old: any = {};
    for (var s in style){
        old[s] = (<any>ctx)[s];
        (<any>ctx)[s] = (<any>style)[s];
    }
    return old;
}

export function popStyle(ctx: CanvasRenderingContext2D, style: ICanvasStyle){
    for (var s in style){
        (<any>ctx)[s] = (<any>style)[s];
    }
}

export abstract class StylableCanvasShape implements ICanvasChildShape, IStylable{

    public parent: ICanvasChildShape;
    public style: ICanvasStyle;
    public _bb: IRectangle;

    public draw(ctx: CanvasContext){
        var last = applyStyle(this.style, ctx);
        this.drawShape(ctx);
        applyStyleToContext(ctx, this._bb);
        unapplyStyle(last, ctx);
    }

    public abstract drawShape(ctx: CanvasContext): void;
}

export {applyStyle, unapplyStyle} from './apply';
export {applyStyleToContext} from "./draw";
