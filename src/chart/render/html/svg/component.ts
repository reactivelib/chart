import {svg} from "@reactivelib/html";
import {html} from "@reactivelib/html";
import {node} from "@reactivelib/reactive";
import {ICanvasChildShape} from "../../canvas/shape/index";
import {variable} from "@reactivelib/reactive";
import {ILabelStyle} from "../../canvas/label/cache/index";
import {getStyleForSvg} from "../../canvas/label/cache/svg";

export interface ISVGComponentSettings{
    background?: string;
    x: number;
    y: number;
    rotate?: number;
    svg: html.IHtmlShapeTypes;
}

export class SVGComponent implements html.IHtmlConfig{

    public parent: ICanvasChildShape;
    public $r = node();
    public parentSvg: SVGSVGElement;
    public node: svg.ISvgShape;
    public attr: any;
    public r_width = variable(10);
    public r_height = variable(10);

    get height(){
        return this.r_height.value;
    }

    set height(v){
        this.r_height.value = v;
    }

    get width(){
        return this.r_width.value;
    }

    set width(v){
        this.r_width.value = v;
    }

    public tag: "svg";

    get svg(){
        return this.settings.svg;
    }

    get background(){
        return this.settings.background;
    }

    get x(){
        return this.settings.x;
    }

    get y(){
        return this.settings.y;
    }

    set x(x: number){
        this.settings.x = x;
    }

    set y(v){
        this.settings.y = v;
    }

    get rotate(){
        return this.settings.rotate;
    }

    public rect: html.IHtmlConfig;

    get child(){
        var self = this;
        return {
            tag: "g",
            get child(){
                var childs: any = [self.svg];
                var rect: html.IHtmlConfig;
                if (self.background){
                    rect = {
                        tag: "rect",
                        attr: {
                            x: "0", y:"0", width: "1", height: "1",
                            fill: self.background
                        }
                    };
                    self.rect = rect;
                    childs = [rect, self.svg];
                }
                return childs;
            }
        };
    }

    public pcr: SVGRect;
    public pc: SVGRect;
    private _diffX: number;
    private _diffY: number;

    constructor(public settings: ISVGComponentSettings){
        var self = this;
        this.attr = {
            get x(){
                return self.x;
            },

            get y(){
                return self.y;
            }
        }
    }


    public first = true;

    public render(ctx){
        this.node.renderAll();
        if (this.first){
            var rect: html.IHtmlConfig = this.rect;
            this.pcr = this.node.element.getBBox();
            var cn = 0;
            this.pc = (<SVGSVGElement>this.node.element.childNodes[cn]).getBBox();
            if (this.background){
                (<SVGSVGElement>rect.node.element).setAttribute("y", ""+this.pc.y);
                (<SVGSVGElement>rect.node.element).setAttribute("width", this.pc.width+"");
                (<SVGSVGElement>rect.node.element).setAttribute("height", this.pc.height+"");
            }
            var rrot = "";
            if (this.rotate){
                var mx = this.pc.width / 2;
                var my = this.pc.height / 2;
                var rot = Math.round(180 / Math.PI * this.rotate);
                var rrot = "rotate("+rot+", "+mx+", "+my+")";
                (<SVGSVGElement>this.node.element.childNodes[cn]).setAttribute("transform", rrot);
                this.pcr = this.node.element.getBBox();
            }
            (<SVGSVGElement>this.node.element.childNodes[cn]).setAttribute("transform", "translate("+(-this.pcr.x)+", "+(-this.pcr.y)+") "+rrot);
            var width = this.pcr.width;
            var height = this.pcr.height;
            this.width = width;
            this.height = height;
            this.node.element.setAttribute("width", width+"");
            this.node.element.setAttribute("height", height+"");
            this._diffX = 0;
            this._diffY = 0;
            this.first = false;
        }
    }

}

SVGComponent.prototype.tag = "svg";

class LabelComponentSettings implements ISVGComponentSettings{

    constructor(public style: ILabelStyle, public svg: html.IHtmlShapeTypes){

    }

    public r_x = variable(0);
    public r_y = variable(0);

    get y(){
        return this.r_y.value;
    }

    set y(v){
        this.r_y.value = v;
    }

    get x(){
        return this.r_x.value;
    }

    set x(v){
        this.r_x.value = v;
    }

    get background(){
        return this.style.background;
    }

    get rotate(){
        return this.style.rotate;
    }
}

export function svgComponentLabel(style: ILabelStyle, content: html.IHtmlShapeTypes): SVGComponent{
    var svg;
    if (typeof content === "string"){
        var attributes: any = getStyleForSvg(style);
        var st: any = {};
        svg = {
            tag: "text",
            attr: attributes,
            style: st,
            child: content
        }
    }
    else {
        svg = content || "";
    }
    var res = new SVGComponent(new LabelComponentSettings(style, svg));
    return res;
}