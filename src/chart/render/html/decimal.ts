/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {html} from "@reactivelib/html";
import {DecimalNumberFormatter, IDecimalFormat} from "../../../format/decimal";
import {IBaseShape} from "@reactivelib/html";
import {
    createFormatterFromConfig,
    default as decimalFormat,
} from "../../../format/decimal";

export interface IDecimalAttrProps extends html.IHtmlAttributesAndProperties{
    format?: string | IDecimalFormat;
}

export interface IDecimalTextElementConfig extends html.IElementConfig{

    format?: string | IDecimalFormat;
    value: number;

}

export class HTMLNumberTextRenderer implements html.IHtmlNodeComponent{

    private _format: any;
    private _value: number;
    public element: Text;
    private formatter: DecimalNumberFormatter;
    public parent: html.IHtmlNodeShape;
    public __shape_node: boolean;

    constructor(public settings: IDecimalTextElementConfig){

    }

    set value(n: number){
        this._value = n;
        this.init();
    }

    get value(){
        return this._value;
    }

    set format(f: any){
        this._format = f;
        if (typeof this.format === "string"){
            this.formatter = decimalFormat(this.format);
        }
        else
        {
            this.formatter = createFormatterFromConfig(this.format);
        }
        this.init();
    }

    public render(ctx: html.IHtmlRenderContext){
        ctx.push(this.element);
    }

    public destroy(){

    }

    get format(){
        return this._format;
    }

    public init(){
        if (this.format && "_value" in this){
            if (!this.element){
                this.element = document.createTextNode("");
            }
            this.element.nodeValue = this.formatter.format(this.value);
        }
    }

}

HTMLNumberTextRenderer.prototype.__shape_node = true;

export function createNumberTextShape(config: IDecimalTextElementConfig){
    var r = new HTMLNumberTextRenderer(config);
    r.format = config.format;
    r.value = config.value;
    return r;
}