/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasConfig} from "../create";
import {IRectangle} from "../../../../../geometry/rectangle/index";
import {CanvasContext} from "../../context/index";
import {findCanvasShape} from "../../html/util";
import {CachedLabel} from "../../label/cache/index";
import {calculateFontHeight} from "../../../html/measure";
import {ICanvasStyle} from "../../style/index";
import {ICanvasChildShape} from "../index";
import {procedure} from "@reactivelib/reactive";
import {find} from "../../find/box";
import {IPoint} from "../../../../../geometry/point/index";
import {IFindInfo} from "../../find/index";

export interface ILabelShapeSettings extends ICanvasConfig{
    
    tag: "label";
    style?: ICanvasStyle;
    text: string;
    rotate?: number;
    backgroundStyle?: string;
    x?: number;
    y?: number;
}

export class LabelShape implements ICanvasChildShape{

    public parent: ICanvasChildShape;
    public cache: CachedLabel;
    public lastProc: procedure.IProcedure;
    public _bb: IRectangle;

    constructor(public settings: ILabelShapeSettings){

    }

    onAttached(){
        var cs = findCanvasShape(this);
        var sets = this.settings;
        this.lastProc = procedure(p => {
            var fh = calculateFontHeight(sets.style, cs.element);
            this.cache = new CachedLabel(sets.text, fh, sets.style, sets.rotate, sets.backgroundStyle);
        });
    }

    get width(){
        return this.cache.canvasEl.width || 0;
    }

    get height(){
        return this.cache.canvasEl.height || 0;
    }

    get x(){
        return this.settings.x || 0;
    }

    get y(){
        return this.settings.y || 0;
    }

    set x(v){
        this.settings.x = v;
    }

    set y(v){
        this.settings.y = v;
    }

    onDetached(){
        this.lastProc.cancel();
        this.cache = null;
    }

    draw(ctx: CanvasContext){
        var x = this.x;
        var y = this.y;
        var pt = ctx.transform.transform(x, y);
        x = pt.x;
        y = pt.y;
        this._bb = {
            x: x, y: y, width: this.width, height: this.height
        };
        ctx.context.drawImage(this.cache.canvasEl, Math.round(x), Math.round(y), this.width, this.height);
    }

    get boundingBox(){
        return this._bb;
    }

    find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{
        return find(this, pt, ctx);
    }

}