/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CoreChart} from "../core/basic";
import {IPieChartSettings} from "./factory";
import {PieChartFocus} from "./focus";
import {array, variable} from "@reactivelib/reactive";
import {IPieSeriesSettings, PieSeries} from "./series";
import {create, init, inject} from "../../config/di";
import {getTheme, IGlobalChartSettings} from "../style";
import unique from "../../color/generator";
import seriesCollection from './seriesCollection'
import seriesManager from './seriesManager';
import {ICanvasChildShape} from "../render/canvas/shape";
import {PieChartGrid} from "./grid";
import {PieChartLabelLayouter} from "./label";
import {PieTooltip} from "./tooltip";

export class PieChart extends CoreChart{

    constructor(public settings: IPieChartSettings) {
        super(settings);
    }

    @create
    seriesFactory(settings: IPieSeriesSettings, globalSettings: IPieSeriesSettings){
        return new PieSeries(settings, globalSettings)
    }

    @create(function(this: PieChart){
        return () => {
            var uq = unique(this.theme.series.colors);
            return () => {
                return uq.next();
            }
        }
    })
    colorProvider: () => () => string

    @create(function(this: PieChart){
        return this.settings;
    })
    chartSettings: IPieChartSettings

    @create(function(this: PieChart){
        const self = this;
        var g =  {
            tag: "g",
            get child(){
                return self.series.values.map(s => s.renderer);
            }
        }
        this.center.getLayer(0).getCanvas().child.push(g);
        return g;
    })
    seriesCanvasGroup: ICanvasChildShape

    @create(function(this:  PieChart){
        return this.grid.shape;
    })
    layoutShape

    @create(() => new PieChartGrid())
    grid: PieChartGrid

    @create(() => new PieChartLabelLayouter())
    label: PieChartLabelLayouter

    @create(function(this: PieChart){
        return seriesCollection(this, this.settings, (settings, globalSettings) => this.seriesFactory(settings, globalSettings));
    })
    series: array.IReactiveArray<PieSeries>

    @create(function(this: PieChart){
        return seriesManager(this.series, this.center, this, this.settings, this.colorProvider);
    })
    seriesManager: () => void;

    @create(() => new PieTooltip())
    tooltip: PieTooltip

    @create(() => new PieChartFocus())
    focus: PieChartFocus

    @init
    init(){
        super.init()
        this.center.getLayer(10).getSvg();
        this.series
        this.tooltip
        this.focus
        this.seriesCanvasGroup
        this.label
    }

    public r_centerX = variable<number>(0);
    get centerX(){
        return this.r_centerX.value;
    }
    set centerX(v){
        this.r_centerX.value = v;
    }

    public r_centerY = variable<number>(0);
    get centerY(){
        return this.r_centerY.value;
    }
    set centerY(v){
        this.r_centerY.value = v;
    }
}