/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {applyStyle} from "../../context/index";
import affineMatrix from "../../../../../math/transform/matrix";
import {ICanvasStyle} from "../../style/index";
import {IShapeConfig} from "@reactivelib/html";
import {IRectangleBaseShape} from "../../../rectangle";

export type LabelType = string | IRectangleBaseShape | IShapeConfig;

/**
 * @editor
 */
export interface ILabelStyle{
    /**
     * The font like defined in css. If you specify this, you should not specify the other font properties like @api{fontFamily} as they
     * will overwrite this value.
     *
     *
     * ```.javascript
     * "italic 23px Arial"
     * ```
     */
    font?: string;
    /**
     * The font family, like defined in css.
     */
    fontFamily?: string;
    /**
     * The font style, like defined in css.
     */
    fontStyle?: string;
    /**
     * The font size, like defined in css.
     */
    fontSize?: string;
    /**
     * The font weight, like defined in css.
     */
    fontWeight?: string;
    /**
     * The font variant, like defined in css.
     */
    fontVariant?: string;
    /**
     * Will rotate the label by the given number. May not work in older browsers if html is used to render the text.
     */
    rotate?: number;
    /**
     * stroke color of the text. Does not work with html labels.
     */
    stroke?: string;
    /**
     * fill color of the text.
     */
    fill?: string;
    /**
     * The background color of the label.
     */
    background?: string;
}

export class CachedLabel{

    public canvasEl: HTMLCanvasElement;

    constructor(public label: string, public fontHeight: number, public fontStyle: ICanvasStyle, 
                public rotate: number, public backgroundColor: string){
        this.canvasEl = document.createElement("canvas");
        this.refresh();
    }

    public refresh(){
        var style = this.fontStyle;
        var rotate = this.rotate || 0;
        var ctx = this.canvasEl.getContext("2d");
        ctx.textBaseline = "middle";
        applyStyle(ctx, style);
        var width = Math.ceil(ctx.measureText(this.label).width);

        var matrix = affineMatrix();
        if (rotate){
            matrix.rotate(rotate);
            var tl = matrix.transform(0, 0);
            var tr = matrix.transform(width,  0);
            var bl = matrix.transform(0, this.fontHeight);
            var br = matrix.transform(width, this.fontHeight);
            var left = Math.min(tl.x, tr.x, bl.x, br.x);
            var right = Math.max(tl.x, tr.x, bl.x, br.x);
            var top = Math.min(tl.y, tr.y, bl.y ,br.y);
            var bottom = Math.max(tl.y, tr.y, bl.y, br.y);
            var trL = Math.round(-Math.min(0, left));
            var trT = Math.round(-Math.min(0, top));
            var rotWidth = right - left;
            var rotHeight = bottom - top;
        }
        else {
            trL = 0;
            trT = 0;
            rotWidth = width;
            rotHeight = this.fontHeight;
        }

        this.canvasEl.width = rotWidth;
        this.canvasEl.height = rotHeight;
        ctx = this.canvasEl.getContext("2d");
        ctx.clearRect(0, 0, rotWidth, rotHeight);
        applyStyle(ctx, style);
        ctx.textBaseline = "top";
        ctx.translate(trL, trT);
        if (rotate){
            ctx.rotate(rotate);
        }
        if (this.fontStyle.strokeStyle){
            ctx.strokeText(this.label, 0.5, 0.5);
        }
        if (this.backgroundColor){
            var old = ctx.fillStyle;
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, rotWidth, rotHeight);
            ctx.fillStyle = old;
        }
        if (this.fontStyle.fillStyle){
            ctx.fillText(this.label, 0, 0);
        }
    }
}