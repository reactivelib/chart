/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../index";
import {procedure} from "@reactivelib/reactive";
import {CanvasContext} from "../../context/index";
import {AffineMatrix} from "../../../../../math/transform/matrix";
import {IPoint} from "../../../../../geometry/point/index";

export class BufferingRenderer implements ICanvasChildShape{

    constructor(public shape: ICanvasChildShape){
        this.shape.parent = this;
    }

    public parent: ICanvasChildShape;
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    private procedure: procedure.IProcedure;
    private isDirty = false;
    private update = false;
    private canvasContext: CanvasContext;
    private lastTransform: AffineMatrix;

    public onAttached(){
        var s: any = this.shape;
        s.onAttached && s.onAttached();
        this.canvas = <HTMLCanvasElement>document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.update = false;
        this.procedure = procedure.unchanged((p) => {
            if (this.update){
                this.isDirty = false;
                this.context.clearRect(this.canvasContext.translateX, this.canvasContext.translateY, this.canvas.width, this.canvas.height);
                this.shape.draw(this.canvasContext);
            }
            else
            {
                p.changedDirty();
                this.isDirty = true;
            }
        });
        this.lastTransform = new AffineMatrix(0,0,0,0,0,0);
    }

    public onDetached(){
        var s: any = this.shape;
        s.onDetached && s.onDetached();
        this.context = null;
        this.canvas = null;
        this.procedure.cancel();
    }

    public draw(ctx: CanvasContext){
        var p1 = ctx.transform.transform(ctx.x, ctx.y);
        var p2 = ctx.transform.transform(ctx.x + ctx.width, ctx.y + ctx.height);
        var xs = Math.round(Math.min(p1.x, p2.x));
        var xe = Math.round(Math.max(p1.x, p2.x));
        var ys = Math.round(Math.min(p1.y, p2.y));
        var ye = Math.round(Math.max(p1.y, p2.y));
        var h = ye - ys;
        var w = xe - xs;
        if (this.canvas.width !== w){
            this.canvas.width = w;
            this.isDirty = true;
        }
        if (this.canvas.height !== h){
            this.canvas.height = h;
            this.isDirty = true;
        }
        if (!this.lastTransform.isEqual(<AffineMatrix>ctx.transform)){
            this.isDirty = true;
        }
        if (this.isDirty){
            this.canvasContext = this.bufferCopy(ctx, xs, ys, w, h);
            this.canvasContext.translateX += xs;            
            this.canvasContext.translateY += ys;
            this.update = true;
            this.procedure.update();
            this.update = false;
        }
        else {
        }
        ctx.context.drawImage(this.canvas, xs, ys);
        this.lastTransform = <AffineMatrix>ctx.transform.copy();
        this.procedure.observed();
    }
    
    public bufferCopy(ctx: CanvasContext, xs: number, ys: number, w: number, h: number){
        this.context.setTransform(1,0,0,1,0,0);
        return ctx.bufferCopy(this.context, xs, ys, w, h);
    }

    public find(pt: IPoint, ctx: CanvasContext){
        var s: any = this.shape;
        return s.find && s.find(pt, ctx);
    }

}