/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {variable, procedure, unobserved} from "@reactivelib/reactive";
import {IInteractionMode} from "./modus/index";
import {IXYChartInteractionModes, IXYChartInteractionSettings} from "./factory";
import {create, init, inject} from "../../../config/di";
import {XYChart} from "../index";
import {ICancellable} from "@reactivelib/reactive/src/cancellable";
import {TooltipSuppressionMovementPlugin} from "./tooltip";
import {XMovementPlugin, YMovementPlugin} from "./move";
import {IWindowChanger} from "../../../math/domain/constrain";
import {MovementPluginGroup, registerShapeDocumentMovement} from "../../render/html/interaction/move/move";
import {defaultTheme, IGlobalChartSettings} from "../../style";
import {YMovementXZoomPlugin} from "./movement/x/zoom";
import {SelectionMovementPlugin} from "./selection";
import {createDirectionMovementPlugin} from "../../render/html/interaction/move/direction";

export interface IXYChartInteraction{
    /**
     * Will ignore any mouse and touch events for this chart.
     */
    ignore: boolean;
}

export class XYChartInteraction implements IXYChartInteraction{
    
    public ignore: boolean;

    constructor(){

    }

    @inject
    chart: XYChart

    @inject
    domainChanger: IWindowChanger

    @inject
    theme: IGlobalChartSettings

    @create(function(this: XYChartInteraction){
        var res = variable<IXYChartInteractionSettings>(null).listener(v => {
            var settings = this.chart.settings;
            if (settings.interaction){
                v.value = settings.interaction;
            }
            else{
                v.value = {};
            }
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    interactionSettings: variable.IVariable<IXYChartInteractionSettings>

    @create(function(this: XYChartInteraction){
        var res = variable<XYChartInteraction>(null).listener(v => {
            v.value = null;
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    masterInteraction: variable.IVariable<XYChartInteraction>

    @create(function(this: XYChartInteraction){
        var res = variable<IInteractionMode[]>(null).listener(v => {
            var modes = this.interactionSettings.value.modes || (this.chart.type === "x" ? ["movezoom", "select"] : ["select", "move"]);
            var res: IInteractionMode[] = [];
            modes.forEach(m => {
                var im = <IInteractionMode>this[m];
                res.push(im);
            });
            v.value = res;
        });
        this.chart.cancels.push(res.$r);
        return res;
    })
    public r_modes: variable.IVariable<IInteractionMode[]>;

    get modes(){
        return this.r_modes.value;
    }
    set modes(v){
        this.r_modes.value = v;
    }

    @create(function(this: XYChartInteraction){
        var wrapped: boolean = null;
        var res = variable<variable.IVariable<IXYChartInteractionModes>>(null).listener(v => {
            var masterInteraction = this.masterInteraction;
            if (masterInteraction.value){
                v.value = masterInteraction.value.r_mode;
                return;
            }
            var interactionSettings = this.interactionSettings;
            if (interactionSettings.value.mode){
                v.value = {
                    get value() {
                        return interactionSettings.value.mode;
                    },
                    set value(v) {
                        interactionSettings.value.mode = v;
                    }
                }
                wrapped = true;
            }
            else if (wrapped !== false){
                var vari = variable<IXYChartInteractionModes>(this.chart.type === "x" ? "movezoom": "select");
                v.value = vari;
                wrapped = false;
            }
        });
        this.chart.cancels.push(res.$r);
        return {
            get value(){
                return res.value.value;
            },
            set value(v){
                res.value.value = v;
            }
        }
    })
    public r_mode: variable.IVariable<IXYChartInteractionModes>;

    get mode(){
        return this.r_mode.value;
    }

    set mode(v){
        this.r_mode.value = v;
    }

    @create(function(this: XYChartInteraction){
        var mover = new TooltipSuppressionMovementPlugin(new XMovementPlugin(() => this.chart.viewports.primary.mapper,
            this.domainChanger, this.chart.r_xAxes, this.chart.center), this.chart);
        return mover;
    })
    mover: TooltipSuppressionMovementPlugin

    @create(function(this: XYChartInteraction){
        var chart = this.chart;
        var theme = this.theme;
        var primaryViewport = this.chart.viewports.r_primary;
        var iconProvider = variable<string>(null).listener(v => {
            if (chart.type === "x"){
                v.value = (theme.icons && theme.icons.xmove) || defaultTheme.icons.xmove
            }
            else{
                v.value = (theme.icons && theme.icons.move) || defaultTheme.icons.move;
            }
        });
        chart.cancels.push(iconProvider.$r);


        var plugin = new TooltipSuppressionMovementPlugin(new MovementPluginGroup([new XMovementPlugin(() => primaryViewport.value.mapper,
            this.domainChanger, this.chart.r_xAxes, chart.center),
            new YMovementPlugin(() => primaryViewport.value.mapper, this.domainChanger, this.chart.r_yAxes, chart.center)]), chart);
        return {
            handler: () => {
                var pl = plugin;
                if (chart.type === "xy"){
                    pl = this.mover;
                }
                var mov = registerShapeDocumentMovement(pl);
                chart.center.events.add(mov);
                return {
                    cancel: () => {
                        chart.center.events.remove(mov);
                    }
                };
            },
            get icon(){
                return iconProvider.value
            },
            title: "Move",
            id: "move"
        };
    })
    move

    @create(function(this: XYChartInteraction){
        return new TooltipSuppressionMovementPlugin(new YMovementXZoomPlugin(() => this.chart.viewports.primary.mapper,
            () => this.chart.viewports.primary.window, this.domainChanger, this.chart.r_xAxes, this.chart.center), this.chart);
    })
    zoomer: TooltipSuppressionMovementPlugin

    @create(function(this: XYChartInteraction){
        var theme = this.theme;
        return {
            title: "Move and Zoom",
            icon: (theme.icons && theme.icons.zoom) || defaultTheme.icons.zoom,
            handler: () => {
                var mov = registerShapeDocumentMovement(this.zoomer);
                this.chart.center.events.add(mov);
                return {
                    cancel: () => {
                        this.chart.center.events.remove(mov);
                    }
                };
            },
            id: "zoom"
        }
    })
    zoom

    @create(function(this: XYChartInteraction){
        var chart = this.chart;
        var theme = this.theme;
        var smp = new SelectionMovementPlugin(chart.center, this.domainChanger,
            chart.viewports.r_primary, chart.r_xAxes, chart.r_yAxes);
        var proc = procedure(() => {
            smp.xOnly = chart.type === "x";
        });
        chart.cancels.push(proc);
        var xplugin = new TooltipSuppressionMovementPlugin(smp, chart);
        return {
            title: "Select",
            icon: (theme.icons && theme.icons.select) || defaultTheme.icons.select,
            handler: () => {
                var mov = registerShapeDocumentMovement(xplugin);
                chart.center.events.add(mov);
                return {
                    cancel: () => {
                        chart.center.events.remove(mov);
                    }
                }
            },
            id: "select"
        }
    })
    select

    @create(function(this: XYChartInteraction){
        var zooms: any[] = ["up", "down"];
        var moves: any[] = ["left", "right"];
        if (this.chart.yAxes.origin === "left" || this.chart.yAxes.origin === "right"){
            var z = zooms;
            zooms = moves;
            moves = z;
        }
        var zoomer = this.zoomer;
        var mover = this.mover;
        var theme = this.theme;
        var decder = createDirectionMovementPlugin({
            directions: [{
                direction: zooms[0],
                plugin: zoomer
            },{
                direction: zooms[1],
                plugin: zoomer
            },{
                direction: moves[0],
                plugin: mover
            },{
                direction: moves[1],
                plugin: mover
            }]
        });
        return {
            title: "movezoom",
            icon: (theme.icons && theme.icons.move) || defaultTheme.icons.move,
            handler: () => {
                var mov = registerShapeDocumentMovement(decder);
                this.chart.center.events.add(mov);
                return {
                    cancel: () => {
                        this.chart.center.events.remove(mov);
                    }
                }
            },
            id: "movezoom"
        }
    })
    movezoom

    @create(function(this: XYChartInteraction){
        var theme = this.theme;
        var select = (theme.icons && theme.icons.select) || defaultTheme.icons.select;
        var move = (theme.icons && theme.icons.move) || defaultTheme.icons.move;
        if (this.chart.type === "x"){
            return {
                select: {
                    icon: select,

                }
            }
        }
        else {

        }
    })
    modus

    initHandler(){
        var last: ICancellable;
        var proc = procedure(p => {
            var m = this.mode;
            if (last){
                last.cancel();
            }
            var mds = this.modes;
            for (var i=0; i < mds.length; i++){
                var mod = mds[i];
                if (mod.id === m){
                    break;
                }
                mod = null;
            }
            if (mod){
                unobserved(() => {
                    last = mod.handler();
                });

            }
        });
        this.chart.cancels.push(proc);
    }

    @init
    init() {
        this.initHandler()
    }

}

XYChartInteraction.prototype.ignore = false;