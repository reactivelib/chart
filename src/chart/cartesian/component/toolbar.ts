/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {create, deps, inject} from "../../../config/di";
import {notifyMaximizationInToolbar} from "../interaction/maximization";
import {IPointRectangle} from "../../../geometry/rectangle/index";
import {IAxisCollection} from "../axis/collection/index";
import {IntervalBackedPointRectangle} from "../../../geometry/rectangle/pointRect";
import {defaultTheme, IGlobalChartSettings} from "../../style";
import {XYChartInteraction} from "../interaction/index";
import {IInteractionMode} from "../interaction/modus/index";
import {variable} from '@reactivelib/reactive';
import {procedure} from "@reactivelib/reactive";
import {html} from "@reactivelib/html";
import {extend} from "@reactivelib/core";
import {
    IRelativePosComponentFactory,
    RelativePositionedComponentProxy
} from "../../../component/layout/axis/component/factory";
import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative";
import {CoreChart} from "../../core/basic";
import {array} from "@reactivelib/reactive";
import {HTMLComponent} from "../../render/html/component";
import {IComponentConfig} from "../../../component/layout/axis";
import {INamedRelativePosComponentFactory} from "../../component";

export interface IInteractionButtonSettings{
    style?: html.ICSSStyle;
    activeStyle?: html.ICSSStyle;
}

export interface IToolbarComponentSettings extends IComponentConfig{
    button?: IInteractionButtonSettings;
    type: "toolbar";
}

export class Toolbar{

    public tag="div";
    public attr: any;
    public child = array<html.IHtmlShapeTypes>();
    public style: any;

    constructor(){
        this.attr = {
            class: "reactivechart-toolbar"
        }
        this.style = {
            whiteSpace: "nowrap"
        }
    }
}

export class XYToolBarComponent implements INamedRelativePosComponentFactory{

    name = "toolbar"

    @inject
    public r_xAxes: variable.IVariable<IAxisCollection>
    @inject
    public r_yAxes: variable.IVariable<IAxisCollection>
    @create(function(this: XYToolBarComponent){
        return () => new IntervalBackedPointRectangle(this.r_xAxes.value.maxWindow, this.r_yAxes.value.maxWindow)
    })
    public domain: () => IPointRectangle
    @inject
    public theme: IGlobalChartSettings
    @inject
    public interaction: XYChartInteraction
    @inject
    public chart: CoreChart

    public create(settings: IRelativePositionedGridElement): IRelativePositionedGridElement{
        var comp = <IToolbarComponentSettings> settings.component;
        if (typeof comp === "string"){
            comp = {
                type: "toolbar"
            }
        }
        var toolbar = new Toolbar();
        var maximize = (this.theme.icons && this.theme.icons.maximize) || defaultTheme.icons.maximize;
        notifyMaximizationInToolbar(toolbar, this.r_xAxes, this.r_yAxes, this.domain, maximize, this.theme);
        var idToMode: {[s: string]: ModeHTML} = {
            
        };
        this.interaction.modes.forEach(mode => {
            var st = extend({}, this.theme.interaction && this.theme.interaction.button && this.theme.interaction.button.style, comp.button && comp.button.style );
            var ast = extend({}, this.theme.interaction && this.theme.interaction.button && this.theme.interaction.button.activeStyle, comp.button && comp.button.activeStyle );
            var m = new ModeHTML(mode, this.interaction, st, ast);
            toolbar.child.push(m);
            idToMode[mode.id] = m;
        });
        var last: ModeHTML = null;
        procedure(p => {
            var m = this.interaction.mode;
            var hm = idToMode[m];
            if (last){
                last.select(false);
            }
            if (hm){
                last = hm;
                hm.select(true);
            }
        });
        var rect = new HTMLComponent(variable.transformProperties({
            html: toolbar,
            x: 0,
            y: 0
        }));
        rect.style.zIndex = 20;
        var res = new RelativePositionedComponentProxy(settings, rect);
        return res;
    }

}

export class ModeHTML{

    public tag: "div";

    public isSelected = false;
    public child: any;
    public r_currentStyle = variable<any>(null);
    public style: any;

    get currentStyle(){
        return this.r_currentStyle.value;
    }

    set currentStyle(v){
        this.r_currentStyle.value = v;
    }

    constructor(public mode: IInteractionMode, public interaction: XYChartInteraction, public cssStyle: html.ICSSStyle, public activeStyle: html.ICSSStyle){
        var self = this;
        this.child = {
            tag: "button",
            prop: {
                suppressCanvasEvents: true,
                onclick: function(ev){
                    self.interaction.mode = mode.id;
                }
            },
            attr: {
                title: mode.title
            },
            get style(){
                return self.currentStyle;
            }
        };
        this.style = {
            display: "inline-block"
        }
        this.cssStyle.backgroundImage = "url('"+mode.icon+"')";
        this.activeStyle.backgroundImage = "url('"+mode.icon+"')";
        this.cssStyle.display = "block";
        this.activeStyle.display = "block";
        this.currentStyle = this.cssStyle;
    }
    
    public select(sel: boolean){
        if (sel){
            this.currentStyle = this.activeStyle;
        }
        else
        {
            this.currentStyle = this.cssStyle;
        }
    }

}

ModeHTML.prototype.tag = "div";