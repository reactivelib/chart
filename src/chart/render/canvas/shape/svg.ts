/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "./index";
import {IRectangle} from "../../../../geometry/rectangle/index";
import {html} from "@reactivelib/html";
import {node, unobserved} from "@reactivelib/reactive";
import {findCanvasShape} from "../html/util";
import {svg} from "@reactivelib/html";
import {attach, detach} from "@reactivelib/html";
import {CanvasContext} from "../context/index";
import {ICanvasConfig} from "./create";
import {IPoint} from "../../../../geometry/point/index";
import {boundingBoxInteracts} from "../find/box";
import {IFindInfo} from "../find/index";

/**
 * A svg component is a rectangle containing svg shapes. The width and height of the rectangle is
 * equal to the bounding box of the svg content.
 * 
 * 
 * The svg content position is transformed so that its top left position of the bounding box matches the x,y position of the rectangle.
 */
export interface ISVGComponentShape extends ICanvasChildShape, IRectangle {

    /**
     * The svg inside the component
     */
    svg: html.IHtmlConfig | html.IHtmlElementShape;
    
    background: string;

}

/**
 * An svg shape, drawn directly into the viewport.
 */
export interface ISVGShape extends ICanvasChildShape{
    /**
     * The svg shape.
     */
    svg: html.IHtmlConfig | html.IHtmlElementShape;
}

/**
 * Settings for a @api{ISVGComponentShape}
 */
export interface ISVGComponentShapeSettings extends ICanvasConfig{
    tag: "svg-component";
    /**
     * Initial x-position
     */
    x?: number;
    /**
     * Initial y-position
     */
    y?: number;
    /**
     * The svg inside the component
     */
    svg: html.IHtmlConfig | html.IHtmlElementShape;
    /**
     * Rotate the shape using given radians
     */
    rotate?: number;
}

/**
 * Settings for @api{ISVGShape}
 */
export interface ISVGShapeSettings extends ICanvasConfig{
    tag: "svg";
    /**
     * The svg shape.
     */
    svg: html.IHtmlConfig | html.IHtmlElementShape;
}

export class SVGSurface implements ICanvasChildShape, ISVGComponentShape{


    public __shape_node: boolean;
    public parent: ICanvasChildShape;
    public $r = node();
    private nodeElement: svg.ISvgShape;
    public _height: number = 10;
    public _width: number = 10;
    public _x: number = 0;
    public _y: number = 0;
    public svg: html.IHtmlConfig | html.IHtmlElementShape;
    public rotate: number;
    public background: string;
    public parentSvg: SVGSVGElement;
    public parentNode: Node;

    get height(){
        this.$r.observed();
        return this._height;
    }

    get y(){
        this.$r.observed();
        return this._y;
    }

    set y(v: number){
        this._y = v;
        this.$r.changedDirty();
    }

    get x(){
        this.$r.observed();
        return this._x;
    }

    set x(v: number){
        this._x = v;
        this.$r.changedDirty();
    }

    get width(){
        this.$r.observed();
        return this._width;
    }

    public onDetached(){
        if (this.parentNode){
            detach(this.nodeElement);
            this.nodeElement = null;
            this.parentNode = null;
            this.hidden = true;
        }
    }
    public hidden = true;
    public pcr: SVGRect;
    public pc: SVGRect;
    private _diffX: number;
    private _diffY: number;

    public onAttached(){
        unobserved(() => {
            if (this.parentSvg){
                this.parentNode = this.parentSvg;
            }
            else {
                var cs = findCanvasShape(this);
            }
            var childs: any = [this.svg];
            var rect: svg.ISvgShape;
            if (this.background){
                rect = <svg.ISvgShape>svg({
                        tag: "rect",
                        attr: {
                            x: "0", y:"0", width: "1", height: "1",
                            fill: this.background
                        }
                });
                childs = [rect, this.svg];
            }
            var conf = {
                tag: "svg",
                child: {
                    tag: "g",
                    child: childs
                }
            }
            this.nodeElement = <svg.ISvgShape>svg(conf);
            (<SVGSVGElement>this.nodeElement.element).setAttribute("visibility", "hidden");
            attach(this.parentNode, this.nodeElement);
            this.pcr = this.nodeElement.element.getBBox();
            var cn = 0;
            this.pc = (<SVGSVGElement>this.nodeElement.element.childNodes[cn]).getBBox();
            if (this.background){
                rect.element.setAttribute("y", ""+this.pc.y);
                rect.element.setAttribute("width", this.pc.width+"");
                rect.element.setAttribute("height", this.pc.height+"");
            }
            var rrot = "";
            if (this.rotate){
                var mx = this.pc.width / 2;
                var my = this.pc.height / 2;
                var rot = Math.round(180 / Math.PI * this.rotate);
                var rrot = "rotate("+rot+", "+mx+", "+my+")";
                (<SVGSVGElement>this.nodeElement.element.childNodes[cn]).setAttribute("transform", rrot);
                this.pcr = this.nodeElement.element.getBBox();
            }
            (<SVGSVGElement>this.nodeElement.element.childNodes[cn]).setAttribute("transform", "translate("+(-this.pcr.x)+", "+(-this.pcr.y)+") "+rrot);
            var width = this.pcr.width;
            var height = this.pcr.height;
            this._width = width;
            this._height = height;
            this._diffX = 0;
            this._diffY = 0;
        });
    }

    public _bb: IRectangle;

    public draw(ctx: CanvasContext){
        var pcr = this.pcr;
        var inv = ctx.transform;
        var sp = inv.transform(this.x, this.y);
        var x = Math.round(sp.x + ctx.translateX - this._diffX);
        var y = Math.round(sp.y + ctx.translateY - this._diffY);
        this._bb = {
            x: x, y: y, width: this.width, height: this.height
        }
        this.nodeElement.element.setAttribute("x", x+"");
        this.nodeElement.element.setAttribute("y", y+"");
        if (this.hidden){
            this.nodeElement.element.removeAttribute("visibility");
            this.hidden = false;
        }
    }

    public find(pt: IPoint, ctx: CanvasContext): IFindInfo[]{        
        if (this._bb && boundingBoxInteracts(this._bb, pt, ctx.interaction.interaction.screenPadding)){
            return [{
                shape: this,
                zIndex: ctx.interaction.interaction.zIndex || 0
            }];
        }
        return [];
    }


}

SVGSurface.prototype.parentSvg = null;

SVGSurface.prototype.__shape_node = true;

export function renderSvgShape(settings: ISVGComponentShapeSettings){
    var res = new SVGSurface();
    if (settings.x){
        res.x = settings.x;
    }
    if (settings.y){
        res.y = settings.y;
    }
    if (settings.rotate){
        res.rotate = settings.rotate;
    }
    res.svg = settings.svg;
    return res;
}