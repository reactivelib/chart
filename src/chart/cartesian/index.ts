/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ChartTypes, CoreChart, IChart, IChartSettings, IChartSystem} from "../core/basic";
import {ICartesianSeriesSettings} from "./series/series";
import {ICartesianChartSeriesConfig} from "./series/collection/index";
import {IChartAxisSettings} from "./axis/collection/factory";
import {AxisCollection, IAxisCollection} from "./axis/collection/index";
import {IPointRectangle} from "../../geometry/rectangle/index";
import {IViewportCollection} from "./area/collection/index";
import {array, transaction, variable} from "@reactivelib/reactive";
import {IXYFocus, IXYFocusSettings} from "./focus/index";
import {IXYTooltip, IXYTooltipSettings} from "./tooltip/index";
import {IXYChartInteraction} from "./interaction/index";
import {create, IContainer, init, inject} from "../../config/di";
import {IAxisLabelComponentSettings} from "./label/component";
import {ILegendComponentConfig} from "./component/legend/index";
import {ISpaceComponentConfig} from "../component/space";
import {XYSeriesCollection} from "./series/collection";
import {IChartDataHighlighter} from "./series/render/data/highlight/highlight";
import {IScrollbarComponentSettings} from "./component/scrollbar/factory";
import {IWindowChanger} from "../../math/domain/constrain";
import {ILabelComponentConfig} from "../component/label";
import {IColorScaleSettings} from "../render/canvas/scale/color/index";
import {IRadiusScaleSettings} from "../render/canvas/scale/radius/index";
import {ChartHighlightContext, ICartesianChartDataHighlightSettings} from "./highlight/data";
import {ICartesianViewport, IViewportSettings} from "./area";
import highlight, {ICartesianChartHighlightingSettings} from "./highlight/factory";
import {IXYChartInteractionSettings} from "./interaction/factory";
import {ITickLineSettings, XGridLineRenderer, YGridLineRenderer} from "./grid";
import parseData, {ICartesianChartDataSettings, ITableResults} from './data/parse';
import {ComponentPosition, IRelativePositionedGridElement} from "../../component/layout/axis/positioning/relative";
import {ChartCenter} from "../core/center";
import {XYChartViewportGroup} from "./area/collection";
import {CartesianChartGrid} from "../core/layout/cartesian/factory";
import {LayoutShape} from "../core/layout/controller";
import {XYChartInteraction} from "./interaction";
import {XYFocus} from "./focus";
import {XYTooltip} from "./tooltip";
import {DomainChangeContext} from "./domain/constrain";
import {ReactiveWindow} from "./window";
import {createIdentificationProvider, IIdentifiableSettings} from "../../util/identification";
import {CartesianRadiusScaleCollection} from "./series/render/scale/radius/factory";
import {CartesianColorScaleCollection} from "./series/render/scale/color/factory";
import {xyToolbarLayout} from "./xy/layout";
import {legendLayout} from "./layout/legend";
import {titleLayout} from "./layout/title";
import {scrollbarLayout} from "./layout/scrollbar";
import {axisLabelsLayout} from "./layout/label";
import * as axes from './axes';

/**
 * Chart showing data inside a cartesian coordinate system.
 */
export interface ICartesianChart extends IChart{

    /**
     * The type of this chart
     */
    type: ChartTypes;
    /**
     * The viewports this chart contains
     */
    viewports: IViewportCollection;
    /**
     * The x-axes in this chart
     */
    xAxes: IAxisCollection;
    /**
     * The y-axes in this chart
     */
    yAxes: IAxisCollection;
    /**
     * The window of the primary viewport
     */
    window: IPointRectangle;
    /**
     * The tooltip settings for this chart
     */
    tooltip: IXYTooltip;
    /**
     * The focus that defines what tooltip to show and what data to highlight in the case of a mouse or touch pointer
     * hovering over the chart.
     */
    focus: IXYFocus;
    /**
     * The id if this is a subchart
     */
    id: string;
    /**
     * Maximizes the domain of the primary x-axis
     */
    maximizeX(): void;
    /**
     * Maximizes the domain of the primary y-axis
     * @param force
     */
    maximizeY(force?: boolean): void;    

}


export class XYChart extends CoreChart implements IXYChartSystem{

    get type(){
        return this.settings.type;
    }

    @create(function(this: XYChart){
        return this.idProvider(this.settings);
    })
    id: string;
    @create(() => new XYChartViewportGroup())
    viewports: XYChartViewportGroup;

    @create(function(this: XYChart){
        return axes.xAxes(this.$container, this.settings, this, this.starter);
    })
    public r_xAxes: variable.IVariable<AxisCollection>

    get xAxes(){
        return this.r_xAxes.value;
    }

    set xAxes(v){
        this.r_xAxes.value = v;
    }

    @inject
    $container

    @create(function(this: XYChart){
        return axes.yAxes(this.$container, this.settings, this, this.starter);
    })
    public r_yAxes: variable.IVariable<AxisCollection>

    get yAxes(){
        return this.r_yAxes.value;
    }

    set yAxes(v){
        this.r_yAxes.value = v;
    }

    public r_xAxesExternal = variable<boolean>(false);
    get xAxesExternal(){
        return this.r_xAxesExternal.value;
    }
    set xAxesExternal(v){
        this.r_xAxesExternal.value = v;
    }
    public r_yAxesExternal = variable<boolean>(false);
    get yAxesExternal(){
        return this.r_yAxesExternal.value;
    }
    set yAxesExternal(v){
        this.r_yAxesExternal.value = v;
    }
    @create(() => new CartesianChartGrid())
    grid: CartesianChartGrid

    @create(function(this: XYChart){
        return this.grid.shape
    })
    layoutShape: LayoutShape

    @create(() => new XYSeriesCollection())
    series: XYSeriesCollection;
    @create(function(this: XYChart){
        return this.series
    })
    seriesCollection: XYSeriesCollection
    @create(() => new XGridLineRenderer())
    xGridLines: XGridLineRenderer
    @create(() => new YGridLineRenderer())
    yGridLines: YGridLineRenderer
    @create(function(this: XYChart){
        return new ReactiveWindow(this.viewports)
    })
    window: IPointRectangle;
    @create(() => new XYTooltip())
    tooltip: IXYTooltip;
    @create(() => new XYFocus())
    focus: IXYFocus;
    @create(() => new XYChartInteraction())
    interaction: IXYChartInteraction;
    container: IContainer;

    @create(() => new CartesianRadiusScaleCollection())
    radiusScales: CartesianRadiusScaleCollection

    @create(() => new CartesianColorScaleCollection())
    colorScales: CartesianColorScaleCollection

    @create(function(){
        var vari = variable<ICartesianChartComponentSettings[] | array.IReactiveArray<ICartesianChartComponentSettings>>(null).listener(v => {
            var settings = this.settings;
            if (settings.layout){
                v.value = settings.layout;
                return;
            }
            var yAxesOrigin = this.yAxes.origin;

            if (yAxesOrigin === "bottom" || "top"){
                var yPos: ComponentPosition = "left";
                var yOpos: ComponentPosition = "right";
                var xPos: ComponentPosition = "bottom";
                var xOpos: ComponentPosition = "top";
            }
            else {
                yPos = "bottom";
                yOpos = "top";
                xPos = "left";
                xOpos = "right";
            }
            v.value = <any>axisLabelsLayout(this.yAxes, yPos, yOpos)
                .concat(scrollbarLayout(settings, this.yAxes))
                .concat(legendLayout(settings))
                .concat(titleLayout(settings, this.theme))
                .concat(xyToolbarLayout());
        });
        this.cancels.push(vari.$r);
        return vari;
    })
    layoutSettings: variable.IVariable<ICartesianChartComponentSettings[] | array.IReactiveArray<ICartesianChartComponentSettings>>

    @create(() => createIdentificationProvider({prefix: "chart_"}))
    idProvider: (settings: IIdentifiableSettings) => string



    @create
    _createDomainChangeContext(){
        return new DomainChangeContext()
    }

    @create(function(this: XYChart){
        return this._createDomainChangeContext().domainChanger
    })
    domainChanger: IWindowChanger;           
    settings: ICartesianChartSettings;
    @create(function(this: XYChart){
        var self = this;
        return {
            get value(){
                return (<XYChartViewportGroup>self.viewports).primary
            }
        }
    })
    primaryViewport: variable.IVariable<ICartesianViewport>
    @create(function(this: XYChart){
        return parseData(this.settings, this)
    })
    chartData: variable.IVariable<ITableResults>;

    public createHighlighter(settings?: ICartesianChartDataHighlightSettings): IChartDataHighlighter{
        return new ChartHighlightContext(this, settings);
    }

    public maximizeX(){
        transaction(() => {
            var d = this.xAxes.primary.window;
            d.start = this.xAxes.maxWindow.start;
            d.end = this.xAxes.maxWindow.end;
        });
    }

    public maximizeY(force: boolean = false){
        if (force || this.type === "xy"){
            transaction(() => {
                var d = this.yAxes.primary.window;
                d.start = this.yAxes.maxWindow.start;
                d.end = this.yAxes.maxWindow.end;
            });
        }
    }

    @init
    init(){
        this.series
        this.interaction
        this.xGridLines
        this.yGridLines
        this.tooltip
        highlight(this.settings, this, this.starter, this.series);
        super.init();
    }

}

export interface IXYChartSystem extends ICartesianChart, IChartSystem{

    container: IContainer;
    domainChanger: IWindowChanger;
    /**
     * Create a highlighter that highlight chart data using the given settings
     * @param settings Highlighter configuration
     * @returns The highlighter highlighting the data
     */
    createHighlighter(settings?: ICartesianChartDataHighlightSettings): IChartDataHighlighter;
    center: ChartCenter;

}

/**
 * @editor
 */
export interface ICartesianChartComponentSettings extends IRelativePositionedGridElement{
    /**
     * @editor {constantObject: "type"}
     */
    component: IAxisLabelComponentSettings | ILabelComponentConfig | ILegendComponentConfig
        | ISpaceComponentConfig |  IScrollbarComponentSettings;


    layout?: ICartesianChartComponentSettings[];
}

/**
 * Settings for cartesian charts. See @rest{/kb/cartesian-charts, manual} for more information.
 * @editor {subtypeProperty: "type"}
 */
export interface ICartesianChartSettings extends IChartSettings {    

    data?: string | ICartesianChartDataSettings;
    
    layout?: ICartesianChartComponentSettings[] | array.IReactiveArray<ICartesianChartComponentSettings>;

    viewport?: IViewportSettings | IViewportSettings[];

    highlight?: ICartesianChartHighlightingSettings | ICartesianChartHighlightingSettings[];

    /**
     * Settings on how to render tick lines for the x-axis. If false, will not render tick lines.
     */
    xTickLines?: ITickLineSettings | boolean;
    /**
     * Settings on how to render tick lines for the y-axis. If false, will not render tick lines.
     */
    yTickLines?: ITickLineSettings | boolean;

    /**
     * If true, adds scrollbars to the default chart layout. Default value is false.
     */
    scrollbars?: boolean;
    /**
     * Id of this chart if this is a subchart.
     */
    id?: string;
    /**
     * Settings for the x-axes
     */
    xAxis?: IChartAxisSettings;
    /**
     * Settings on how the user can interact with the chart.
     */
    interaction?: IXYChartInteractionSettings;
    /**
     * Settings for the y-axes
     */
    yAxis?: IChartAxisSettings;
    /**
     *
     */
    tooltip?: IXYTooltipSettings;
    /**
     * All series that are initially added to this chart must be defines here. 
     * 
     *
     * When passing the array, it must contain the configuration of each series that you want to add to this chart.
     * When passing the object, you can define global settings that will be applied to all series.
     * @editor {type: "array-global", property: "series", preview: "id"}
     */
    series?: ICartesianSeriesSettings[] |  ICartesianChartSeriesConfig |  array.IReactiveArray<ICartesianSeriesSettings>;
    /**
     * Configuration of the color scales used inside this chart
     */
    colorScales?: IColorScaleSettings[];
    
    radiusScales?: IRadiusScaleSettings[];
    
    /**
     * Configuration of the chart focus.
     */
    focus?: IXYFocusSettings;

    /**
     * I true, renders a legend
     */
    legend?: boolean;

}