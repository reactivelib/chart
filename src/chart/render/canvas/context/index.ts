/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {InteractionState} from "../interaction/index";
import {AffineMatrix, ITransformation} from "../../../../math/transform/matrix";
import {ICanvasHTMLShape} from "../html/index";
import {ILine} from "../../../../geometry/line/index";
import {IRectangle} from "../../../../geometry/rectangle/index";

export interface IColorStop{
    color: string;
    stop: number;
}

export interface ILinearGradient{

    coordinates?: "shape" | "user";
    line: ILine;
    stops: IColorStop[];

}

export var ctxStyleMappings = {
    backgroundColor: "fillStyle",
    fill: "fillStyle",
    borderColor: "strokeStyle",
    stroke: "strokeStyle",
    borderWidth: "lineWidth",
    opacity: "globalAlpha"
}


export function applyStyle(ctx: CanvasRenderingContext2D, style: any){
    for (var s in style){
        var m = (<any>ctxStyleMappings)[s] || s;
        if (typeof (<any>ctx)[m] !== "function"){
            (<any>ctx)[m] = style[s];
        }
    }
}

/**
 * Contains the current state of the canvas, including style and transformation matrix.
 */
export interface ICanvasContext{
    /**
     * The current style of the canvas.
     */
    style: any;
    /**
     * The current transform. Shapes should use this to map their points to the screen.
     */
    transform: ITransformation;
    /**
     * The canvas rendering context. Use this and the @api{transform} to draw shapes.
     */
    context: CanvasRenderingContext2D;

}

function copyStyle(s: any){
    var st: any = {};
    for (var p in s){
        st[p] = s[p];
    }
    return st;
}

export function applyNone(){
    
}

export class CanvasContext implements ICanvasContext{
    
    public zIndex = 0;
    public interaction = new InteractionState();
    public transform: ITransformation = new AffineMatrix(1, 0, 0, 0, 1, 0);
    public canvasShape: ICanvasHTMLShape;
    public clips: IRectangle[] = [];
    public width: number;
    public height: number;
    public x: number;
    public y: number;

    public style: any = {
        applyFill: applyNone,
        applyStroke: applyNone
    };
    public translateX: number;
    public translateY: number;

    constructor(public context: CanvasRenderingContext2D){
        
    }

    public bufferCopy(cont: CanvasRenderingContext2D, tx: number, ty: number, w: number, h: number): CanvasContext{
        var ctx = new CanvasContext(cont);
        ctx.style = copyStyle(this.style);
        ctx.clips = [];
        ctx.width = this.width;
        ctx.height = this.height;
        ctx.x = this.x;
        ctx.y = this.y;
        ctx.translateX = this.translateX;        
        ctx.translateY = this.translateY;    
        ctx.canvasShape = this.canvasShape;
        ctx.transform = this.transform.copy();
        ctx.interaction = this.interaction.copy();
        cont.translate(-tx, -ty);
        return ctx;
    }
    
    private _oldStyles: any;

    public activate(){
        this._oldStyles = {};
        for (var s in this.style){
            this._oldStyles[s] = (<any>this.context)[s];
            (<any>this.context)[s] = this.style[s];
        }
        if (this.clips.length > 0){
            var c = this.clips[this.clips.length - 1];
            this.context.save();
            this.context.rect(c.x, c.y, c.width, c.height);
            this.context.clip();
        }
        this.context.beginPath();
    }

    public deactivate(){
        if (this.clips.length > 0){
            this.context.restore();
        }
        for (var s in this._oldStyles){
            (<any>this.context)[s] = this._oldStyles[s];
        }
    }

}


export default function context(ctx: CanvasRenderingContext2D): ICanvasContext{
    return new CanvasContext(ctx);
}
