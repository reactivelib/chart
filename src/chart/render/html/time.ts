/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {html} from "@reactivelib/html";
import {IBaseShape} from "@reactivelib/html";
import {DateLocalTimeCalendar, ICalendar, UTCOffsetCalendar} from "../../../math/time/calendar";
import {default as dateFormat} from "../../../format/date";

export interface ITimeTextElementConfig extends html.IElementConfig{
    format?: string;
    time: number;
    offset?: any;
}

export class HTMLTimeTextRenderer implements IBaseShape{
    
    public format: any;
    private _time: number;
    public element: Text;
    public offset: any;
    private formatter: (c: ICalendar) => string;
    public parent: html.IHtmlNodeShape;
    public __shape_node: boolean;

    public settings = null;

    constructor() {
        this.element = document.createTextNode("");
    }

    get parentModel(){
        return this.parent && this.parent.settings;
    }

    set time(t: number){
        this._time = t;
        this.init();
    }

    get time(){
        return this._time;
    }

    public render(ctx: html.IHtmlRenderContext){
        ctx.push(this.element);
    }

    public destroy(){

    }

    public init(){
        this.formatter = dateFormat(this.format);
        var cal;
        if (this.offset === "local"){
            cal = new DateLocalTimeCalendar(this.time);
        }
        else {
            var offs = new UTCOffsetCalendar(this.time);
            offs.offset = this.offset;
            cal = offs;
        }
        this.element.nodeValue = this.formatter(cal);
    }

}

HTMLTimeTextRenderer.prototype.format = "yyyy-MM-dd hh:mm:ss";
HTMLTimeTextRenderer.prototype.offset = "local";
HTMLTimeTextRenderer.prototype.__shape_node = true;

export function createTimeTextShape(config: ITimeTextElementConfig){
    var r = new HTMLTimeTextRenderer();
    if (config.format){
        r.format = config.format;
    }
    if (config.offset){
        r.offset = config.offset;
    }
    r.time = config.time;
    if ("node" in config){
        config.node = r;
    }
    return r;
}