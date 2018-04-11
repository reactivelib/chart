/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array, ICancellable, unobserved, variable} from "@reactivelib/reactive";
import {IGlobalChartSettings} from "../style";
import {dummyPadding, IPadding, IRectangle, PaddedRectange} from "../../geometry/rectangle/index";
import {ITargetAndContent, TooltipManager} from "../render/html/tooltip/manager";
import {html, mapper} from "@reactivelib/html";
import {HTMLComponent, IHtmlComponentConfig} from "../render/html/component";

export interface ITooltipDelaySettings{
    delay?: number;
}

export class TooltipComponent extends HTMLComponent{

    render(ctx: html.IHtmlRenderContext){
        this.node.renderAll();
        this.recalculateDimensions();
    }

    public applyCoordinates(){
        this.recalcPosition(this.node);
        this.makeVisible();
    }

    constructor(settings: IHtmlComponentConfig){
        super(settings);
        this.style.pointerEvents = "none";
    }

    private _x: number = 0;
    private _y: number = 0;

    get x(){
        return this._x;
    }

    set x(v){
       this._x = v;
    }

    get y(){
        return this._y;
    }

    set y(v){
        this._y = v;
    }

    public spacePadding: IPadding;

}

export interface ITargetAndContentAndPadding extends ITargetAndContent{
    padding: IPadding;
}

export class ChartTooltipManager extends TooltipManager{

    public tooltips: array.IReactiveArray<ITargetAndContentAndPadding> = array();
    public queue: array.IReactiveArray<ITargetAndContentAndPadding> = array();
    public r_children = variable<html.IHtmlNodeComponent[]>([]);

    get children(){
        return this.r_children.value;
    }

    set children(v){
        this.r_children.value = v;
    }
    public contents: IRectangle[] = [];
    public mapper = mapper<ITargetAndContentAndPadding, html.IHtmlNodeComponent>(tg => {
        var comp = new TooltipComponent(variable.transformProperties({
            html: <html.IHtmlConfig>tg.content,
            x: 0,
            y: 0
        }));
        comp.spacePadding = tg.padding;
        return html(comp);
    }, {
        onRemoved: (v) => {
            v.onDetached();
        }
    });

    constructor(container: IRectangle, public settings: variable.IVariable<ITooltipDelaySettings>, public theme: IGlobalChartSettings){
        super(container);        
    }

    public tag = "custom";

    public render(ctx: html.IHtmlRenderContext){
        this.children.forEach(c => c.render(ctx));
        this.layout(this.children.map((c, indx) => {
            var tc = this.contents[indx];
            var ttc = <TooltipComponent>(<html.IHtmlShape>c).settings;
            return {
                target: tc,
                content: new PaddedRectange(ttc, ttc.spacePadding || dummyPadding)
            }
        }));
        this.children.forEach(c => {
            (<TooltipComponent>(<html.IHtmlShape>c).settings).applyCoordinates();
        });
    }

    public lastTimeout: any = null;
    public processQueue(){
        var vals = this.queue.values;
        this.contents = [];
        for (var i=0; i < vals.length; i++){
            var tc = vals[i];
            this.tooltips.push(tc);
            this.contents.push(tc.target);
        }
        this.queue.clear();
        this.lastTimeout = null;
        this.children = this.mapper.map(this.tooltips.values);
    }

    private startQueue(force = false){
        if (this.lastTimeout){
            clearTimeout(this.lastTimeout);
            this.lastTimeout = null;
        }
        var del = (this.settings.value.delay)  || (this.theme.tooltip && this.theme.tooltip.delay);
        if (!force && del && del > 0){
            this.lastTimeout = setTimeout(() => {
                this.processQueue();
            }, del);
        }
        else{
            unobserved(() => {
                this.processQueue();
            });
        }
    }

    public add(tc: ITargetAndContentAndPadding): ICancellable{
        this.queue.push(tc);
        this.startQueue();
        return {
            cancel: () => {
                this.queue.remove(this.queue.array.indexOf(tc));
                this.tooltips.remove(this.tooltips.array.indexOf(tc));
                this.startQueue(true);
            }
        }
    }

}