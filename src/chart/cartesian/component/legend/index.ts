/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianSeries} from "../../series/series";
import {ISeriesGroup} from "../../series/group";
import {array, variable, ICancellable, nullCancellable} from "@reactivelib/reactive";
import {XYChart} from "../../index";
import {IGroupableSeriesCollection} from "../../../series/collection";
import {deps, buildAndFetch, IContainer, join, define, create, inject, init} from "../../../../config/di";
import {ISeries} from "../../../series/index";
import {IGlobalChartSettings} from "../../../style";
import {
    IRelativePosComponentFactory,
    RelativePositionedComponentProxy
} from "../../../../component/layout/axis/component/factory";
import {IRelativePositionedGridElement} from "../../../../component/layout/axis/positioning/relative";
import {CoreChart} from "../../../core/basic";
import {HTMLComponent, IHtmlComponentConfig} from "../../../render/html/component";
import {html} from "@reactivelib/html";
import {IComponentConfig} from "../../../../component/layout/axis";
import {extend} from '@reactivelib/core'

function findRepresentingSeries(chart: XYChart, id: string){
    var s = chart.series.get(id);
    if (!s){
        return (<IGroupableSeriesCollection>chart.series).groups.get(id);
    }
    return s;
}

class LegendElement{

    public tag: "li";
    public style: any;
    public cancellable: ICancellable = nullCancellable;
    public event: any;
    public node: html.IHtmlShape;
    public rect: any;
    public over: variable.IVariable<boolean>;

    @inject
    componentSettings: ILegendComponentConfig

    public cancel(){
        this.cancellable.cancel();
    }

    constructor(public series: ICartesianSeries){
    }


    get child(){
        var series = this.series;
        var res = [this.rect, {
            tag: "div",
            child: [this.series.label || this.series.id]
        }];
        var self = this;
        res.push({
            tag: "div",
            style: {
                position: "absolute",
                height: "2px",
                get background(){
                    return ((series.color && series.color.toRGB().toString()) || "rgb(255, 0, 0)")
                },
                pointerEvents: "none",
                bottom: "0",
                width: "100%",
                left: "0",
                get visibility(){
                    if(self.over.value){
                        return "visible";
                    };
                    return "hidden";
                }
            }
        })
        return res;
    }

    @init
    init(){
        var series = this.series;
        var over = variable(false);
        this.over = over;
        this.style = {
            display: "inline-block",
            padding: "0",
            paddingLeft: "14px",
            paddingRight: "8px",
            margin: "0",
            position: "relative"
        };
        var entered = false;
        this.rect = {
            tag: "div",
            style: extend({
                position: "absolute",
                top: "0",
                bottom: "0",
                margin: "auto",
                left: "0",
                width: "10px",
                height: "10px",
                borderRadius: "5px",
                get background(){
                    return ((series.color && series.color.toRGB().toString()) || "rgb(255, 0, 0)")
                }
            }, this.componentSettings.textStyle)
        }

        this.event = {
            mouseenter: (ev) => {
                if (!entered){
                    this.cancellable = series.highlight();
                    over.value = true;
                    entered = true;
                }
            },
            mouseleave: (ev) => {
                this.cancellable.cancel();
                over.value = false;
                entered = false;
            }
        };
    }

}

LegendElement.prototype.tag = "li";


class LegendComponentSettings implements IHtmlComponentConfig{

    public html;
    public r_x = variable<number>(0);
    public r_y = variable<number>(0);

    @inject
    componentSettings:  ILegendComponentConfig

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

    @create
    createLegendElement(s: ICartesianSeries){
        return new LegendElement(s)
    }

    constructor(public seriesIds: array.IReactiveArray<ICartesianSeries>){

    }

    @init
    init(){
        this.html = {
            tag: "ul",
            attr: {
                class: "reactivechart-legend"
            },
            style: extend({
                padding: "0",
                margin: "0",
                listStyle: "none",
                whiteSpace: "nowrap",
                display: "list-item"
            }, this.componentSettings.style),
            child: <array.IReactiveArray<any>>this.seriesIds.reactiveMap(m => {
                return this.createLegendElement(m);
            })
        };
    }

}

export class LegendComponent{


    @define
    rawSettings: ILegendComponentConfig | string
    @create(function(this: LegendComponent){
        return (id: string): ISeries | ISeriesGroup => findRepresentingSeries(this.chart, id);
    })
    findSeries: (id: string) => ICartesianSeries
    @inject
    chart: XYChart

    @inject
    theme: IGlobalChartSettings

    @create(function(this: LegendComponent){
        return extend({}, this.theme.legend, this.rawSettings);
    })
    componentSettings:  ILegendComponentConfig

    @create(function(this: LegendComponent){
        var settings = this.componentSettings;
        if (settings.series){
            return array(settings.series.map(s => this.findSeries(s)));
        }
        return this.chart.series.collection.reactiveMap(s => s);
    })
    series: array.IReactiveArray<ICartesianSeries>

    @create
    createComponentSettings(){
        return new LegendComponentSettings(this.series)
    }

    @create(function(this: LegendComponent){
        return new HTMLComponent(this.createComponentSettings())
    })
    shape: HTMLComponent
}

/**
 * @editor
 */
export interface ILegendComponentConfig extends IComponentConfig{
    
    type: "legend";
    series?: string[];
    attr?: any;
    style?: any;
    textStyle?: any;
}

export class LegendComponentFactory implements IRelativePosComponentFactory{

    name = "legend";

    constructor(){

    }

    @create
    createLegendComponent(rawSettings: ILegendComponentConfig | string){
        var lc = new LegendComponent();
        lc.rawSettings = rawSettings;
        return lc;
    }

    create(comp: IRelativePositionedGridElement){
        var c = <ILegendComponentConfig | string>comp.component;
        if (typeof c === "string"){
            c = <ILegendComponentConfig | string>{
                type: c
            }
        }
        var co = this.createLegendComponent(c).shape;
        var res =  new RelativePositionedComponentProxy(comp, co);
        return res;
    }

}