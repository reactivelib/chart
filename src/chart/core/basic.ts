/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array, ICancellable, variable} from "@reactivelib/reactive";
import {IDimension, IRectangle} from "../../geometry/rectangle/index";
import {ICanvasStyle} from "../render/canvas/style/index";
import {MultiStarter} from "../../config/start";
import {ICalendarSettings} from "../../math/time/calendar";
import {IGridIntervalSettings} from "../render/canvas/layout/axis/positions";
import {ICanvasShapeOrConfig} from "../render/canvas/shape/create";
import {getTheme, IGlobalChartSettings} from "../style";
import {html} from "@reactivelib/html";
import {SimpleRectangleHTMLConfig} from "../render/html/absoulte";
import {CenterSVG} from "./center/svg";
import {ChartCenter} from "./center/index";
import {LayoutShape} from "./layout/controller";
import {IRelativePositionedGridElement} from "../../component/layout/axis/positioning/relative/index";
import {IPictureSettings} from "./picture";
import {component, create, define, init} from "../../config/di";
import calendar from '../calendar';
import unique from "../../color/generator";
import {color, IColor} from "../../color";
import {parseDimensionSettings} from "./dimension";
import {onAttached} from "./element";
import Promise from 'promise-polyfill';
import html2canvas from 'html2canvas';
import {IBorderStyle} from "../render/style/border";

/**
 * Base class for each chart
 */
export interface IChart extends ICancellable, html.IHtmlConfig{
    tag: string;
    /**
     * The center of the chart were the graphs are drawn.
     */
    cancelled: boolean;
    refresh(): void;
    containingElement: HTMLElement;
    center: IRectangle;
    takePicture(settings?: IPictureSettings): Promise<HTMLCanvasElement>;
}

export interface IChartSystem extends IChart, IRectangle{
    starter: MultiStarter;
    cancels: ICancellable[];
    center: ChartCenter;
}

export interface ICenterBorderLineSettings{
    style?: ICanvasStyle;
    overflow?: IGridIntervalSettings;
}

export interface ICenterBorderSettings{
    
    top?: boolean | ICenterBorderLineSettings; 
    left?: boolean | ICenterBorderLineSettings;
    right?: boolean | ICenterBorderLineSettings;
    bottom?: boolean | ICenterBorderLineSettings;
    style?: ICanvasStyle;
    
}

/**
 * Settings around the chart center.
 */
export interface ICenterSettings{
    /**
     * The class name of the center html div.
     */
    class?: string;
    /**
     * Show a border around the chart center
     */
    border?: string | IBorderStyle;

    shape?: ICanvasShapeOrConfig;

    ignoreBorderDimensions?: boolean;
}

/**
 * Defines the type of the chart. 
 * 
 * 
 * Following chart types are available:
 * 
 * |type|description|
 * |-|-|
 * |x|creates a @api{chart.IXSortedChartSettings}|
 * |xy|creates a @api{chart.ICartesianChartSettings}|
 *
 */
export type ChartTypes = "x" | "xy" | "pie";

/**
 * Configures the width or height of a chart
 * @editor
 */
export interface IDimensionSettings{

    /**
     * Defines the minimal value if set to "auto"
     */
    min?: number;
    /**
     * Defines the maximal value if set to "auto"
     */
    max?: number;
    /**
     * The width or height. If "auto", will consider the min and max if set.
     */
    value?: number | "auto";
    
}

/**
 * Basic chart settings
 * @public
 */
export interface IChartSettings{
    
    /**
     * How to render labels. The 'canvas' setting renders labels using canvas technology. 'html' uses html elements.
     * While html usually has better quality, canvas is more performant.
     * @default canvas
     */
    labelRenderer?: "html" | "canvas" | "svg";

    /**
     * The type of the chart.
     *
     * @editor {proxy: "nonOptionalIfFirst"}
     */
    type?: "x" | "xy" | "pie";

    shape?: html.IHtmlShapeTypes;
    /**
     * Width of the chart. If "auto" is specified, the chart will adapt to the width of the element it was attached to.
     * @default auto
     */
    width?: number | "auto" | IDimensionSettings;
    /**
     * Height of the chart
     */
    height?: number | "auto" | IDimensionSettings;
    /**
     * The chart title. Can be rendered as component in the chart layout.
     */
    title?: string;
    /**
     * The HTMLElement the chart will be attached to. Accepts either a string with the id of the element or the element itself.
     * When not specified, the chart will not be attached to the html body.
     *
     * @editor {default: "chart"}
     *
     */
    element?: string | HTMLElement;
    /**
     * The chart subtitle. Can be rendered as component in the chart layout.
     */
    subtitle?: string;
    /**
     * Components that will be added to the layout
     */
    layout?: IRelativePositionedGridElement[] | array.IReactiveArray<IRelativePositionedGridElement>;

    center?: ICenterSettings;
    /**
     * @typeDescription
     * @default Will use the local calendar
     */
    calendar?: ICalendarSettings;

    chart?: IChart;
}

@component("chart")
export class CoreChart extends SimpleRectangleHTMLConfig implements IChartSystem{

    @create(() => new ChartCenter())
    public center: ChartCenter;
    @define
    public cancels: ICancellable[] = [];

    @define
    public calendarFactory = calendar;
    @define
    starter: MultiStarter = new MultiStarter();

    @create(function(){return this.starter})
    chartStarter: MultiStarter;
    public r_cancelled = variable<boolean>(false);
    @create(getTheme)
    public theme: IGlobalChartSettings;
    @create(() => new CenterSVG())
    public chartSVG: CenterSVG;
    public layoutShape: LayoutShape;
    public containingElement: HTMLElement;
    public shapes = array<html.IHtmlShapeTypes>();

    public r_node = variable<html.IHtmlShape>(null);
    public _ctx: html.IIndexedHtmlRenderContext;
    public r_temporaryDimensions = variable<IDimension>(null);

    @create(function(this: CoreChart){
        var width = variable<IDimensionSettings>(null).listener(v => {
            if (!this.cancelled){
                v.value = parseDimensionSettings(this.settings.width);
            }
        });
        return width;
    })
    widthSetting: variable.IVariable<IDimensionSettings>

    @create(function(this: CoreChart){
        var height = variable<IDimensionSettings>(null).listener(v => {
            if (!this.cancelled){
                v.value = parseDimensionSettings(this.settings.height);
            }
        });
        return height;
    })
    heightSetting: variable.IVariable<IDimensionSettings>



    @create(function(this: CoreChart){
        var vari = variable<IRelativePositionedGridElement[] | array.IReactiveArray<IRelativePositionedGridElement>>(null).listener(v => {
            if (this.settings.layout){
                v.value = this.settings.layout;
            }
            else{
                v.value = [];
            }
        });
        this.cancels.push(vari.$r);
        return vari;
    })
    layoutSettings: variable.IVariable<IRelativePositionedGridElement[] | array.IReactiveArray<IRelativePositionedGridElement>>

    @create(function(this: CoreChart){
        var uni = unique(this.theme.series.colors);
        return (): IColor => {
            return  color(uni.next());
        }
    })
    provideColor: () => IColor

    @create(function(this: CoreChart){
        var ids = 0;
        return function(){
            ids++;
            return "series_"+ids;
        }
    })
    provideSeriesId: () => string

    @create(function(this: CoreChart){
        var ids = 0;
        return function(){
            ids++;
            return "area_"+ids;
        }
    })
    provideAreaId: () => string

    @define
    public settings: IChartSettings;

    @create(function(this: CoreChart){
        return this.settings
    })
    chartSettings: IChartSettings

    @init
    init(){
        this.chartSVG
        var cancel = this.starter.start();
        this.cancels.push(cancel);
    }

    get temporaryDimensions(){
        return this.r_temporaryDimensions.value;
    }

    set temporaryDimensions(v){
        this.r_temporaryDimensions.value = v;
    }

    public takePicture(settings){
        var self = this;
        var res = new Promise((resolve, reject) => {
            var set = settings || <any>{};
            this.temporaryDimensions = set;
            var rendered = false;
            var shape = {
                tag: "custom",
                render(ctx){
                    if (!rendered){
                        setTimeout(() => {
                            html2canvas(self.node.element,{
                                logging: false
                            }).then((canvas) => {
                                self.temporaryDimensions = null;
                                self.shapes.remove(self.shapes.indexOf(shape));
                                resolve(canvas);
                            }, (err) => {
                                self.temporaryDimensions = null;
                                self.shapes.remove(self.shapes.indexOf(shape));
                                reject(err);
                            })
                        }, 0);
                    }
                    rendered = true;
                }
            };
            this.shapes.push(shape);
        });
        return res;
    }

    get child(){
        return (<any[]>[this.layoutShape]).concat(this.shapes.values);
    }

    get node(){
        return this.r_node.value;
    }

    set node(v){
        this.r_node.value = v;
    }

    public onAttached(){

    }

    isAttached = false;

    attachCanc: ICancellable

    public render(ctx: html.IIndexedHtmlRenderContext){
        if (!this.isAttached){
            this.isAttached = true;
            if (!this.node.parent){
                par = <HTMLElement>this.node.element.parentNode;
            }
            else {
                var par: HTMLElement = <HTMLElement>((<html.IHtmlShape>this.node.parent).settings instanceof CoreChart ? null : (this.node.parent ? (<html.IHtmlShape> this.node.parent).element : (<html.IHtmlShape>this.node).element.parentNode))
            }
            if (this.containingElement){
                par = <HTMLElement>this.containingElement;
            }
            this.attachCanc = onAttached(par, this, this.settings, this.widthSetting, this.heightSetting);
        }
        this.node.renderAll();
    }

    public onDetached(){
        if (this.isAttached){
            this.isAttached = false;
            this.attachCanc.cancel();
        }
    }
    
    public afterLayout(){
        
    }

    public insertedToLayout(){
        
    }

    public removedFromLayout(){

    }

    refresh(){

    }

    get cancelled(){
        return this.r_cancelled.value;
    }

    set cancelled(v){
        this.r_cancelled.value = v;
    }

    constructor(settings: IChartSettings){
        super();
        this.settings = settings;
    }

    public cancel(){
        if (!this.cancelled){
            this.cancels.forEach(c => c.cancel());
            this.cancelled = true;
        }
    }

}