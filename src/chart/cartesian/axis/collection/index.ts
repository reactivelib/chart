/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {
    IDiscreteAxisSettings, IDiscreteXYAxis, IXYAxis, IXYAxisSettings, IXYAxisSystem, XAxisXYAxisSystem,
    XYAxisSystem, YAxisXYAxisSystem
} from "../index";
import {array, ICancellable, variable} from "@reactivelib/reactive";
import {findInIterator} from "../../../../collection/iterator/index";
import {IPointInterval} from "../../../../geometry/interval/index";
import {CoordinateOrigin} from "../../../render/canvas/shape/group/transform/mapper";
import {IWindowResizer} from "../../../../math/domain/window/resize";
import {IChartAxisSettings, IDomainOffsetSettings} from "./factory";
import {IChartAxisLabels} from "../../label";
import {component, create, define, inject} from "../../../../config/di";
import {AxisCollectionCreation} from "./create";
import * as maxWindow from './maxWindow'
import {ICartesianChartSettings, XYChart} from "../../index";
import {syncByMarkersAxis} from "../../../../math/domain/axis/sequence";
import {IAxis} from "../../../../math/domain/axis/axis";
import {syncLogMarkerDomains} from "../../../../math/domain/axis/log";
import {syncLinearDomains} from "../../../../math/domain/axis/snyc";
import {IIterable} from "../../../../collection/iterator";
import {AxisProvider} from "./synchronize";
import {procedure} from "@reactivelib/reactive";
import resize from './resize';
import {XLabelLayout, YLabelLayout} from "./label";

/**
 * Contains the primary and secondary axes of the "x" or "y" side
 */
export interface IAxisCollection{

    /**
     * Returns the axis with the given id. Returns null if not found
     * @param id
     */
    get(id: string): IXYAxis;
    /**
     * The primary axis. Each chart must have a primary axis for both the "x" and "y" side. The primary axis cannot 
     * be changed.
     */
    primary: IXYAxis;

    secondary: array.IReactiveArray<IXYAxis>;
    /**
     * Resizes the chart window, based on the current state of the chart. 
     */
    resizer: IWindowResizer;
    /**
     * The biggest window interval. Chart window will maximize to this interval if the maximize button is clicked.
     */
    maxWindow: IPointInterval;

    /**
     * Window of the primary axis
     */
    window: IPointInterval;
    /**
     * 
     */
    origin: CoordinateOrigin;
    

}

function cancelIf(c: any){
    if ("cancel" in c){
        c.cancel();
    }
}
@component("axes")
export class AxisCollection implements IAxisCollection{

    @define
    public axisLabels: array.IReactiveArray<IChartAxisLabels> = array<IChartAxisLabels>();
    @create
    public r_resizer: variable.IVariable<IWindowResizer>

    get resizer(){
        return this.r_resizer.value;
    }

    set resizer(v) {
        this.r_resizer.value = v;
    }

    create_r_resizer(){
        return resize(this, this.collectionCreation.r_primary, this.r_maxWindow, this.axesSettings);
    }

    @create
    public r_maxWindow: variable.IVariable<IPointInterval>;
    @inject
    chart: XYChart

    get maxWindow(){
        return this.r_maxWindow.value;
    }

    set maxWindow(v){
        this.r_maxWindow.value = v;
    }

    create_r_maxWindow(){
        return maxWindow.maxWindow(this.chart, this, this.collectionCreation.r_primary, this.axesSettings, this.r_offsetSettings);
    }

    @create
    public r_offsetSettings: variable.IVariable<IDomainOffsetSettings>;

    get offsetSettings(){
        return this.r_offsetSettings.value;
    }

    set offsetSettings(v){
        this.r_offsetSettings.value = v;
    }

    create_r_offsetSettings(){
        return maxWindow.offsetSettings(this.axesSettings, this.collectionCreation.r_primary, this, this.axisCoordinate, this.chart, this.chart.settings);
    }

    @create
    synchronizer: () => void;

    @inject
    chartSettings: ICartesianChartSettings

    create_synchronizer(){
        var sync: (axis: IAxis, it: IIterable<IAxis>) => void;
        var provider: AxisProvider;
        var proc = procedure(p => {
            provider = new AxisProvider(this);
            if (this.primary.type === "log"){
                sync = syncLogMarkerDomains;
            }
            else
            {
                switch(this.synchronizerType){
                    case "linear":
                        sync = syncLinearDomains;
                        break;
                    case "marker":
                        sync = syncByMarkersAxis;
                        break;
                }
            }
        });
        this.cancels.push(proc);
        return () => {
            sync(provider.primary, provider.getOther());
            this.primary.synchronize();
            this.secondary.forEach(ax => {
                (<IXYAxisSystem>ax).synchronize();
            });
        }
    }

    public defaultOrigin: CoordinateOrigin;
    public cancels: ICancellable[] = [];

    public axisFactory: (settings: IXYAxisSettings) => XYAxisSystem;

    @create
    createAxis(settings: IXYAxisSettings){
        return this.axisFactory(settings);
    }

    @define
    synchronizerType = "marker"
    axisCoordinate: string;

    @create(function(){return new AxisCollectionCreation()})
    collectionCreation: AxisCollectionCreation

    get secondary(){
        return this.collectionCreation.secondary
    }

    get primary(){
        return this.collectionCreation.primary;
    }

    @create(function(){return this.settings})
    axesSettings: IChartAxisSettings;


    settings: IChartAxisSettings;

    public synchronize(){

    }

    @create
    axisIdProvider: () => number;
    create_axisIdProvider(){
        var ids = 0;
        return function(){
            ids++;
            return "axis-"+ids;
        }
    }

    get origin(){
        return this.settings.origin || this.defaultOrigin;
    }

    get window(){
        return this.primary.window;
    }

    public cancel(){
        cancelIf(this.primary);
        this.secondary.forEach(a => {
            cancelIf(a);
        });
        this.cancels.forEach(c => {
            c.cancel();
        })
    }

    remove(name: string){
        return removeFromAxisGroup(this, name);
    }

    public get(name: string): IXYAxis{
        if (this.primary.id === name){
            return this.primary;
        }
        return findInIterator<XYAxisSystem>(this.secondary.iterator(), (a) => a.id === name);
    }

    public add(axis: IDiscreteAxisSettings): IDiscreteXYAxis;
    add(axis: string): IXYAxis;
    public add(name: string | IXYAxisSettings): IXYAxis{
        return addToAxisGroup(this, name);
    }

}

export function getOrCreateAxis(coll: AxisCollection, name: string): IXYAxis{
    var area = coll.get(name);
    if (!area){
        area = coll.add(name);
    }
    return area;
}

export function removeFromAxisGroup(grp: AxisCollection, name: string): IXYAxis{
    var area = findInIterator<XYAxisSystem>(grp.secondary.iterator(), (a) => a.id === name);
    if (area){
        cancelIf(area);
        grp.secondary.remove(grp.secondary.values.indexOf(area));
    }
    return area;
}

export function addToAxisGroup(grp: AxisCollection, name: string | IXYAxisSettings): IXYAxis{
    if (typeof name === "string"){
        name = {id: name};
    }
    var axis = grp.createAxis(name);
    grp.secondary.push(axis);
    return axis;
}

export class XAxisCollection extends AxisCollection{

    @create(function(this: XAxisCollection){
        var self = this;
        return function(settings: IXYAxisSettings){
            return new XAxisXYAxisSystem(settings, self.axesSettings);
        }
    })
    public axisFactory: (settings: IXYAxisSettings) => XYAxisSystem;

    @create(function(this: XAxisCollection){
        return this.chartSettings.xAxis || {};
    })
    settings: IChartAxisSettings

    @define
    defaultOrigin = <CoordinateOrigin>"left";

    @create(() => new XLabelLayout())
    xLabelLayout: XLabelLayout;

    synchronize(){
        this.xLabelLayout.synchronize();
    }

}

XAxisCollection.prototype.axisCoordinate = "x";

export class YAxisCollection extends AxisCollection{

    @create(function(this: XAxisCollection){
        var self = this;
        return function(settings: IXYAxisSettings){
            return new YAxisXYAxisSystem(settings, self.axesSettings);
        }
    })
    public axisFactory: (settings: IXYAxisSettings) => XYAxisSystem;

    @create(function(this: XAxisCollection){
        return this.chartSettings.yAxis || {};
    })
    settings: IChartAxisSettings

    @define
    defaultOrigin = <CoordinateOrigin>"bottom";

    @create(() => new YLabelLayout())
    yLabelLayout: YLabelLayout;

    synchronize(){
        this.yLabelLayout.synchronize();
    }
}

YAxisCollection.prototype.axisCoordinate = "y";