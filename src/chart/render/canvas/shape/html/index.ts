/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../index";
import {CanvasContext} from "../../context/index";
import {IPadding, IRectangle, normalizePaddingSettings} from "../../../../../geometry/rectangle/index";
import {procedure, unobserved, variable as rvar} from "@reactivelib/reactive";
import {ICanvasConfig} from "../create";
import {html} from "@reactivelib/html";
import {attach,detach} from "@reactivelib/html";
import {findCanvasShape} from "../../html/util";
import {CanvasRenderer} from "../../html/index";

/**
 * Configuration of a html shape inside a canvas.
 */
export interface IHtmlRendererConfig extends ICanvasConfig{

    /**
     * The x-position 
     */
    x?: number;
    /**
     * The y-position
     */
    y?: number;
    /**
     * Defines a fixed width. If not specified, width will be determined automatically based on shape size.
     */
    width?: number;
    /**
     * Defines a fixed height. If node specified, height will be determined automatically based on shape size.
     */
    height?: number;
    /**
     * Vertical alignment of this shape relative to the y-position
     */
    valign?: "top" | "bottom" | "center";
    /**
     * Horizontal alignment of this shape relative to the x-position
     */
    halign?: "left" | "right" | "center";
    /**
     * The html to show
     */
    html: html.IHtmlConfig;
    /**
     * A padding to add around the shape
     */
    padding?: IPadding | number;

    rotate?: number;
}


export class SettingsHTMLSurface implements ICanvasChildShape, IHTMLShape{

    public parent: ICanvasChildShape;

    public __shape_node: boolean;
    
    constructor(public settings: IHtmlRendererConfig){
        
    }

    private r_width = rvar(10);
    private r_height = rvar(10);
    
    get valign(){
        return this.settings.valign || "top";
    }
    
    set valign(v){
        this.settings.valign = v;
    }
    
    get halign(){
        return this.settings.halign || "left";
    }
    
    set halign(v){
        this.settings.halign = v;
    }
    public nodeElement: html.IHtmlShape;
    private canvas: CanvasRenderer;
    public padding: IPadding;

    get height(){
        return this.r_height.value;
    }

    set height(v: number){
        this.r_height.value = v;
    }

    get y(){
        return this.settings.y || 0;
    }

    set y(v: number){
        this.settings.y = v;
    }

    get x(){
        return this.settings.x || 0;
    }

    set x(v: number){
        this.settings.x = v;
    }

    get width(){
        return this.r_width.value;
    }

    set width(v: number){
        this.r_width.value = v;
    }

    public elementCreated(el: html.IHtmlShape){

    }

    public onDetached(){
        if (this.canvas){
            this.proc.cancel();
            detach(this.nodeElement);
            this.canvas = null;
            this.nodeElement = null;
            this.hidden = true;
        }
    }
    
    public oldDisplay: string;
    public hidden = true;
    public cr: ClientRect;
    public pcr: ClientRect;
    public proc: procedure.IProcedure;

    public onAttached(){
        unobserved(() => {
            var cs = findCanvasShape(this);
            this.canvas = cs;
            var conf: any = {
                tag: "div",
                style: {
                    position: "absolute",
                    left: this.x+"px",
                    top: this.y+"px"
                },
                properties: {
                    suppressCanvasEvents: true
                },
                render: () => {
                    this.recalculate();
                },
                child: this.settings.html
            };
            this.nodeElement = <html.IHtmlShape>html(conf);
            if (this.settings.rotate){
                var degree = this.settings.rotate;
                (<HTMLElement>this.nodeElement.element).style.transform = "rotate("+degree+"rad)";
            }
            this.oldDisplay = (<HTMLElement>this.nodeElement.element).style.visibility;
            (<HTMLElement>this.nodeElement.element).style.visibility = "hidden";
            attach(this.canvas.element, this.nodeElement);
            this.elementCreated(this.nodeElement);
        });
    }

    public recalculate(){
       /* var cr = (<HTMLElement>(<html.IHtmlShape>this.nodeElement.children[0]).element).getBoundingClientRect();
        this.cr = cr;
        this.pcr = (<HTMLElement>(<html.IHtmlShape>this.nodeElement.children[0]).element).getBoundingClientRect();
        this.width = cr.width;
        this.height = cr.height;*/
    }

    public draw(ctx: CanvasContext){
        var cr = this.cr;
        if (cr.width === 0 || cr.height === 0){
            this.recalculate();
        }
        var pcr = this.pcr;
        var m = this.cr;
        this.width = m.width;
        this.height = m.height;        
        var inv = ctx.transform;
        var sp = inv.transform(this.x, this.y);
        var x = sp.x + ctx.translateX;
        var y = sp.y + ctx.translateY;
        var dx = m.left - pcr.left;
        var dy = m.top - pcr.top;
        x -= dx;
        y -= dy;
        switch(this.valign){
            case "center":
                y = y - m.height / 2;
                break;
            case "bottom":
                y = y - m.height;
                break;
            default:
                break;
        }
        switch(this.halign){
            case "center":
                x = x - m.width / 2;
                break;
            case "right":
                x = x - m.width;
                break;
            default:
                break;
        }
        switch(this.halign){
            case "left":
                x += this.padding.right;
                break;
            case "right":
                x -= this.padding.left;
                break;
            default:
        }
        switch(this.valign){
            case "top":
                y += this.padding.bottom;
                break;
            case "bottom":
                y -= this.padding.top;
                break;
            default:
        }
        (<HTMLElement>this.nodeElement.element).style.left = x+"px";
        (<HTMLElement>this.nodeElement.element).style.top = y+"px";
        if (this.hidden){
            (<HTMLElement>this.nodeElement.element).style.visibility = this.oldDisplay;
            this.hidden = false;
        }
    }


}

SettingsHTMLSurface.prototype.padding = {
    left: 0, right:0, top: 0, bottom: 0
}

SettingsHTMLSurface.prototype.__shape_node = true;

export interface IHTMLShape extends ICanvasChildShape, IRectangle {

}

export function fromConfig(config: IHtmlRendererConfig): IHTMLShape{
    var res = new SettingsHTMLSurface(config);
    if ("padding" in config){
        res.padding = normalizePaddingSettings(config.padding);
    }
    return res;
}