import {variable as rvar} from "@reactivelib/reactive";
import {html} from "@reactivelib/html";
import {IPadding} from "../../../geometry/rectangle/index";
import {ICancellable} from "@reactivelib/reactive";

export interface IHtmlComponentConfig{

    /**
     * The x-position
     */
    x?: number;
    /**
     * The y-position
     */
    y?: number;
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

    html: html.IHtmlShapeTypes;
    /**
     * A padding to add around the shape
     */
    padding?: IPadding | number;

    rotate?: number;

    onAttached?: () => void;
}

export class HTMLComponent implements html.IHtmlConfig{

    public node: html.IHtmlShape;
    public tag: string;
    public style: any
    public _ctx: html.IHtmlRenderContext;

    constructor(public settings: IHtmlComponentConfig){
        this.style = {
            position: "absolute",
            left: "0px",
            top: "0px"
        };
    }

    public onAttached(){
        (<HTMLElement>this.node.element).style.visibility = "hidden";
        if (this.settings.rotate){
            var degree = this.settings.rotate;
            (<HTMLElement>this.node.element).style.transform = "rotate("+degree+"rad)";
        }
        this.settings.onAttached && this.settings.onAttached();
        this.first = true;
    }

    public recalculateDimensions(){
        var cr = (<HTMLElement>(<html.IHtmlShape>(<html.IHtmlShape>this.node).children[0]).element).getBoundingClientRect();
        this.cr = cr;
        this.pcr = (<HTMLElement>(<html.IHtmlShape>(<html.IHtmlShape>this.node)).element).getBoundingClientRect();
        this.width = this.pcr.width;
        this.height = this.pcr.height;
    }

    public makeVisible(){
        (<HTMLElement>this.node.element).style.visibility = "visible";
    }

    public first = true;

    public render(ctx: html.IHtmlRenderContext){
        this.node.renderAll();
        if (this.first){
            this.recalculateDimensions();
            this.first = false;
        }
        this.recalcPosition(<html.IHtmlShape>this.node);
        this.makeVisible();
    }

    get child(){
        return this.settings.html;
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

    public oldDisplay: string;
    public hidden = true;
    public cr: ClientRect;
    public pcr: ClientRect;
    public cancel: ICancellable;

    public recalcPosition(node: html.IHtmlShape){
        var pcr = this.pcr;
        var m = this.cr;
        var x = this.x;
        var y = this.y;
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
        (<HTMLElement>node.element).style.left = x+"px";
        (<HTMLElement>node.element).style.top = y+"px";
    }


}

HTMLComponent.prototype.padding = {
    left: 0, right:0, top: 0, bottom: 0
}

HTMLComponent.prototype.tag = "div";