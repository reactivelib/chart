import {variable} from "@reactivelib/reactive";
import {measureElement} from "../../../chart/render/html/measure/box";
import {html} from "@reactivelib/html";

export class AxisCenterStyle{

    constructor(public center: HTMLAxisCenter){

    }

    position = "absolute";
    boxSizing = "content-box";

    get left(){
        return (this.center.x-this.center.border.left)+"px";
    }

    get top(){
        return (this.center.y - this.center.border.top)+"px";
    }

    get width(){
        return this.center.width+"px";
    }

    get height(){
        return this.center.height+"px";
    }

}

export class HTMLAxisCenter implements html.IHtmlConfig{

    public tag: "div";
    public style: any;

    public r_x = variable<number>(0);
    public r_y = variable<number>(0);
    public r_width = variable<number>(10);
    public r_height = variable<number>(10);

    public border = variable.transformProperties({
        left: 0, top: 0, bottom: 0, right: 0
    })

    public node: html.IHtmlShape;
    public attr: any;

    constructor(){
        var self = this;
        this.attr = {
            class: "reactivechart-center"
        }
        this.initCenterStyle();
    }

    initCenterStyle(){
        this.style = new AxisCenterStyle(this);
    }

    public phase = 1;

    public renderDirect(ctx: html.IHtmlRenderContext){
        this.node.renderAttributes();
        this.node.renderStyles();
        this.node.renderEvents();
        this.node.renderProperties();
        if (this.phase === 1){
            var mes = measureElement(<Element>this.node.element);
            this.border.right = mes.borderRight;
            this.border.top = mes.borderTop;
            this.border.bottom = mes.borderBottom;
            this.border.left = mes.borderLeft;
        }
        else
        {
            this.node.renderChildren();
        }
    }

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

}

HTMLAxisCenter.prototype.tag = "div";