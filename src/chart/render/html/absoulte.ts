import {html} from "@reactivelib/html";
import {array, procedure, variable} from "@reactivelib/reactive";
import {measureElement} from "./measure/box";
import {IPadding} from "../../../geometry/rectangle/index";

export class ContentRectangleHTMLConfig{

    public tag: "div";
    public style: any;

    public r_x = variable<number>(0);
    public r_y = variable<number>(0);
    public r_width = variable<number>(10);
    public r_height = variable<number>(10);

    public r_border = variable<IPadding>({
        left: 0, right: 0, top: 0, bottom: 0
    });

    get border(){
        return this.r_border.value;
    }

    set border(v){
        this.r_border.value = v;
    }

    public proc: procedure.IProcedure;
    public node: html.IHtmlShape;

    constructor(){
        var self = this;
        this.style = {
            position: "absolute",
            border: null,
            get left(){
                return (self.x-self.border.left)+"px";
            },
            get top(){
                return (self.x - self.border.top)+"px";
            },
            get width(){
                return self.width+"px";
            },
            get height(){
                return self.height+"px";
            }
        }
    }

    public render(){
        var mes = measureElement(<Element>this.node.element)
        this.border = {
            right: mes.borderRight,
            top: mes.borderTop + mes.marginTop + mes.paddingTop,
            bottom: mes.borderBottom,
            left: mes.borderLeft + mes.marginLeft + mes.paddingLeft
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

ContentRectangleHTMLConfig.prototype.tag = "div";


export class SimpleRectangleHTMLConfig{

    public tag: string;
    public style: any;

    public r_x = variable<number>(0);
    public r_y = variable<number>(0);
    public r_width = variable<number>(10);
    public r_height = variable<number>(10);

    public node: html.IHtmlShape;

    constructor(){
        var self = this;
        this.style = {
            position: "absolute",
            padding: "0",
            margin: "0",
            border: "none",
            get left(){
                return (self.x)+"px";
            },
            get top(){
                return (self.y)+"px";
            },
            get width(){
                return self.width+"px";
            },
            get height(){
                return self.height+"px";
            }
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

SimpleRectangleHTMLConfig.prototype.tag = "div";