/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array, ICancellable, variable, procedure} from '@reactivelib/reactive';
import {IFlexibleTickAxis} from "../../../math/domain/axis/axis";
import {IIdentifiable} from "../../../util/identification";
import {CartesianSeries, ICartesianSeries} from "../series/series";
import {IAxisSettings} from "../../../math/domain/axis/factory";
import {color} from "../../../color/index";
import {FlexibleDistanceTicks, IFlexibleDistanceTicks} from "../../../math/domain/marker/base";
import {ReactivePointInterval} from "../../reactive/geometry/interval";
import {IPointInterval} from "../../../geometry/interval/index";
import {TimeFlexibleMarkers} from "../../../math/domain/axis/time";
import {AxisTimeUnit, IAxisTimeUnit} from "./time/unit/index";
import {MultiStarter} from "../../../config/start";
import {IReactiveXSortedRingBuffer} from '../../reactive/collection/ring';
import {ICategoryCollection} from './discrete/collection';
import {ILabelStyle} from '../../render/canvas/label/cache/index';
import {component, create, define, inject} from "../../../config/di";
import {ITableResults} from "../data/parse";
import {DiscreteTicks} from "../../../math/domain/marker/categorical";
import {Log10Ticks} from "../../../math/domain/marker/log";
import {ICalendar} from "../../../math/time/calendar";
import {default as iterator, findInIterator, IIterator} from "../../../collection/iterator";
import categories from './discrete/category'
import {LogPointInterval} from "./window";
import {ISeriesMaxDomain, seriesMaxDomainsToX, seriesMaxDomainsToY} from "../series/domain";
import {XYChart} from "../index";
import {IChartAxisSettings} from "./collection/factory";

/**
 * Defines the category for a specific position in a discrete axis
 */
export interface ICategory{

    /**
     * The position this category is defined for
     */
    x: number;
    /**
     * The id of this category
     */
    id: any;
    /**
     * An optional label used by other components. If not defined, the id will be used instead.
     */
    label?: string;
    
}

export type CategoricalLabelSetting = string | ICategory;

/**
 * See @api{IXYAxisSettings.type}
 */
export type AxisTypes = "linear" | "discrete" | "log";

export interface IAxisLabelSettings{

    text: string;
    style?: ILabelStyle;
}

/**
 * Settings for an axis in a cartesian chart. See @rest{/documentation/axis} for more information.
 * 
 */
export interface IXYAxisSettings extends IAxisSettings{
    /**
     * The id of the axis
     */
    id?: string;

    /**
     * The type of the axis.
     */
    type?: AxisTypes;

    label?: string | IAxisLabelSettings;
}

export interface ILogAxisSettings extends IXYAxisSettings{
    type: "log";
}

/**
 * Categorical axis settings.
 */
export interface IDiscreteAxisSettings extends IXYAxisSettings{
    /**
     * Must be of type "discrete"
     */
    type: "discrete";
    
    /**
     * Associate categories with a discrete position.
     * 
     * 
     * Categories are useful to display categorical data
     * For example, if you have population data for
     * 4 countries, you could define 4 countries as categories at position 0, 1, 2, 3 as follows:
     * ```
     * {
     *  categories: ["USA", "FRANCE", "SPAIN", "CHINA"]
     * }
     * ...
     * 
     * ```
     *
     * You can then define a series that contains data for this categories like follows:
     *
     * ```
     * {
     *    data: [{x: 0, y: 300000}, {x: 1, y: 1000000}, ...] 
     * }
     * ```
     *
     */
    categories?: CategoricalLabelSetting[] | IReactiveXSortedRingBuffer<ICategory>;

    /**
     * The series that contains categorical data.
     */
    categorySeries?: string | ICartesianSeries | boolean;
    /**
     * The type of categories. If constant, the value of the category will be interpreted as a constant string.
     * If time, it will be interpreted as a timestamp in miliseconds.
     */
    categoryType?: "time" | "constant";
}

export interface ILinearAxisSettings extends IXYAxisSettings{
    type?: "linear";
    
}

/**
 * An axis in a cartesian chart.
 */
export interface IXYAxis extends IFlexibleTickAxis, IIdentifiable{

    /**
     * The series that are using this axis.
     */
    series: array.IReactiveArray<ICartesianSeries>;
    /**
     * See @api{IXYAxisSettings.type}
     */
    type: AxisTypes;
    
    time: IAxisTimeUnit;
}

/**
 * A categorical axis
 */
export interface IDiscreteXYAxis extends IXYAxis{

    type: "discrete";
    /**
     * The manually defined categories. See @api{IChartCategoricalAxisSettings.categories}
     */
    categories: ICategoryCollection;
    
}

export class FlexibleReactiveDistanceTicks extends FlexibleDistanceTicks{
    
    private r_distance = variable(1);
    
    get distance(){
        return this.r_distance.value;
    }

    set distance(v: number){
        this.setDistance(v);
    }
    
    protected setDistance(v: number){
        var nd = super.setDistance(v);
        this.r_distance.value = nd;
        return nd;
    }
    
}

export class ReactiveTimeFlexibleMarkers extends TimeFlexibleMarkers{

    private r_distance = variable(1);

    get distance(){
        return this.r_distance.value;
    }

    set distance(v: number){
        this.setDistance(v);
    }

    protected setDistance(v: number){
        var nd = super.setDistance(v);
        this.r_distance.value = nd;
        return nd;
    }

}

export class FlexibleTickAxis implements IFlexibleTickAxis{

    public ticks: IFlexibleDistanceTicks;
    public domain: IPointInterval;
    public tickDomain: IPointInterval = new ReactivePointInterval();
    public window: IPointInterval;

    constructor(){
        
    }

}

export interface IXYAxisSystem extends IXYAxis, ICancellable {
    addSeries(series: ICartesianSeries): ICancellable;
    minSize: variable.IVariable<number>;
    synchronizers: (() => void)[];
    synchronize(): void;
    cancels: ICancellable[];
}

@component("axis")
export class XYAxisSystem extends FlexibleTickAxis implements IXYAxisSystem{

    @define
    public series: array.IReactiveArray<ICartesianSeries> = array<ICartesianSeries>();
    public defaultType: AxisTypes;
    public cancels: ICancellable[] = [];
    @create
    public starter: MultiStarter;
    @inject
    chart: XYChart

    create_starter(){
        var s = new MultiStarter();
        this.chart.starter.add(() => {
            return s.start();
        });
        return s;
    }

    @create
    public r_categorySeries: variable.IVariable<CartesianSeries>;

    get categorySeries(){
        return this.r_categorySeries.value;
    }

    set categorySeries(v){
        this.r_categorySeries.value = v;
    }

    create_r_categorySeries(){

        var res = variable<ICartesianSeries>(null).listener(v => {
            var ser = (<IDiscreteAxisSettings>this.axisSettings).categorySeries || (<IDiscreteAxisSettings>this.axesSettings).categorySeries;
            if (!ser){
                v.value = null;
                return;
            }
            var res: ICartesianSeries;
            if (typeof ser === "string") {
                res = <ICartesianSeries>findInIterator(this.series.iterator(), e => e.id === ser);
            }
            else if (typeof ser === "boolean"){
                res = this.series.values[0];
            }
            else {
                res = <ICartesianSeries> ser;
            }
            v.value = res;
        });
        this.cancels.push(res.$r);
        return res;
    }

    @create
    public r_ticks: variable.IVariable<IFlexibleDistanceTicks>;

    @inject
    axisIdProvider: () => string

    @inject
    calendarFactory: (n: number) => ICalendar

    get ticks(){
        return this.r_ticks.value;
    }

    set ticks(v){
        this.r_ticks.value = v;
    }

    create_r_ticks(){
        var res = variable<IFlexibleDistanceTicks>(null);
        var s: number[] = [];
        var axisSettings = this.settings;
        var axesSettings = this.axesSettings;
        res.listener(l => {
            var found = false;
            if (axisSettings.ticks){
                if (axisSettings.ticks.type){
                    var aType = axisSettings.ticks.type;
                    found = true;
                }
            }
            if (axesSettings.ticks){
                if (axesSettings.ticks.type){
                    var aType = axesSettings.ticks.type;
                    found = true;
                }
            }
            if (!found){
                if (this.type === "discrete"){
                    aType = "discrete";
                }
                else {
                    if (this.time.active){
                        aType = "time";
                    }
                    else{
                        aType = "nice";
                    }
                }
            }
            if (this.type === "log"){
                l.value = new Log10Ticks();
            }
            else {
                switch (aType){
                    case "discrete":
                        l.value = new DiscreteTicks();
                        break;
                    case "nice":
                        l.value = new FlexibleReactiveDistanceTicks();
                        break;
                    case "time":
                        l.value = new ReactiveTimeFlexibleMarkers(this.calendarFactory);
                        break;
                }
                if (axisSettings.ticks && axisSettings.ticks.minDistance){
                    l.value.minDistance = axisSettings.ticks.minDistance;
                }
            }
        });
        return res;
    }

    category?: ICategory;
    minSize: variable.IVariable<number>;
    public synchronizers: (() => void)[] = [];
    @create(() => new AxisTimeUnit())
    public time: IAxisTimeUnit;
    @create
    public r_type: variable.IVariable<AxisTypes>

    @inject
    chartData: variable.IVariable<ITableResults>

    get type(){
        return this.r_type.value;
    }

    set type(v){
        this.r_type.value = v;
    }
    create_r_type(){
        var axis = this;
        var chartData = this.chartData;
        var vari = variable<AxisTypes>(null).listener(v => {
            var type = axis.settings.type || axis.parentSettings.type;
            if (!type){
                if (this.xOrY === "x" && chartData.value && chartData.value.categories && chartData.value.categories.length > 0){
                    type = "discrete";
                }
                else{
                    type = "linear";
                }
            }
            v.value = type;
        });
        axis.cancels.push(vari.$r);
        return vari;
    }

    @create
    public r_categories: variable.IVariable<ICategoryCollection>

    get categories(){
        return this.r_categories.value;
    }

    set categories(v){
        this.r_categories.value = v;
    }

    create_r_categories(){
        return categories(<IDiscreteAxisSettings>this.axisSettings, <IDiscreteAxisSettings>this.axesSettings, this, this.r_type, this.time, this.r_categorySeries, this.chartData);
    }

    @create
    public r_id: variable.IVariable<string>;

    get id(){
        return this.r_id.value;
    }

    set id(v){
        this.r_id.value = v;
    }
    create_r_id(){
        var id = variable<string>(null).listener(v => {
            var id = this.axisSettings.id || this.axesSettings.id;
            if (!id){
                id = this.axisIdProvider();
            }
            v.value = id;
        });
        this.cancels.push(id.$r);
        return id;
    }

    @create
    public r_window: variable.IVariable<IPointInterval>;

    get window(){
        return this.r_window.value;
    }

    set window(v){
        this.r_window.value = v;
    }

    create_r_window(){
        var window = variable(null).listener(v => {
            var axisSettings = this.axisSettings;
            var axesSettings = this.axesSettings;
            if (axisSettings.window){
                v.value = axisSettings.window;
            }
            else if (axesSettings.window){
                v.value = axesSettings.window;
            }
            else if (axesSettings.type === "log"){
                v.value = new LogPointInterval();
            }
            else{
                v.value = new ReactivePointInterval();
                v.value.end = 10;
            }
        });
        this.cancels.push(window.$r);
        return window;
    }

    @create
    public domain: IPointInterval;

    create_domain(){
        var domain = new ReactivePointInterval();
        var p = procedure(p => {
            var ivl = this.seriesMaxDomainsToInterval(iterator(this.series.iterator()).map(s => s.domain));
            if (this.type === "discrete"){
                ivl.start -= 0.5;
                ivl.end += 0.5;
            }
            domain.start = ivl.start;
            domain.end = ivl.end;
        });
        this.cancels.push(p);
        return domain;
    }


    seriesMaxDomainsToInterval(domains: IIterator<ISeriesMaxDomain>): IPointInterval{
        return null;
    }

    @define
    public settings: IXYAxisSettings;
    @define
    public axisSettings: IXYAxisSettings;
    @define
    public parentSettings: IChartAxisSettings;
    @inject
    public axesSettings: IChartAxisSettings;

    constructor(settings: IXYAxisSettings, parentSettings: IChartAxisSettings){
        super();
        this.settings = settings;
        this.axisSettings = settings;
        this.parentSettings = parentSettings;
    }

    public synchronize(){
        this.synchronizers.forEach(s => s());
    }

    public cancel(){
        this.cancels.forEach(c => c.cancel());
    }
    
    get color(){
        if (this.series.length > 0){
            return this.series.get(0).color;
        }
        return color("rgb(0,0,0)");
    }

    public addSeries(series: ICartesianSeries){
        this.series.push(series);
        return {
            cancel: () => {
                this.series.remove(this.series.array.indexOf(series));
                this.seriesRemoved(series);
            }
        };
    }
    
    public seriesRemoved(series: ICartesianSeries){

    }

    xOrY: string;


}

XYAxisSystem.prototype.defaultType = "linear";

export class XAxisXYAxisSystem extends XYAxisSystem{

    xOrY = "x";

    seriesMaxDomainsToInterval(it: IIterator<ISeriesMaxDomain>){
        return seriesMaxDomainsToX(it);
    }

}

export class YAxisXYAxisSystem extends XYAxisSystem{

    xOrY = "y";

    seriesMaxDomainsToInterval(it: IIterator<ISeriesMaxDomain>){
        return seriesMaxDomainsToY(it);
    }

}