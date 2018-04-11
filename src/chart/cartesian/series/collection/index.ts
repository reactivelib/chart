/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CartesianSeries, ICartesianSeries, ICartesianSeriesSettings, IXYSeriesSystem} from "../../series/series";
import {ISeriesGroupSettings, SeriesGroupCollection} from "../group";
import {findSeries, IGroupableSeriesCollection} from "../../../series/collection";
import {XYChart} from "../../index";
import {component, create, init, inject} from "../../../../config/di";
import {XCategoryManager, YCategoryManager} from "../../categorical/positioning";
import {SeriesStackManager} from "../../series/stack";
import {array, getReactor, ICancellable, nullCancellable, procedure, unobserved, variable} from "@reactivelib/reactive";
import {HashMap} from "../../../../collection/hash";
import {ISeriesTableEntry, ITableResults} from "../../data/parse";
import {IChartXYSeriesSettings} from "../../xy/series/factory";

/**
 * 
 * Defines the global settings for all series that are defined in the @api{collection} property.
 * @editor
 */
export interface ICartesianChartSeriesConfig extends ICartesianSeriesSettings{
    /**
     * An array with the configuration of all series that should be added to the chart.
     */
    series: ICartesianSeriesSettings[] | array.IReactiveArray<ICartesianSeriesSettings>;
    /**
     * An array containing the configuration of all series groups that should be added to the chart.
     */
    groups?: ISeriesGroupSettings[];
}


export function normalizeSettings(settings: ICartesianChartSeriesConfig | ICartesianSeriesSettings[] | array.IReactiveArray<ICartesianSeriesSettings>): ICartesianChartSeriesConfig{
    if (!settings){
        return {
            series: []
        }
    }
    if (Array.isArray(settings) || array.isReactiveArray(settings)){
        return {
            series: <ICartesianSeriesSettings[]>settings
        }
    }
    return <ICartesianChartSeriesConfig>settings;
}

function cancelIf(c: any) {
    if ("cancel" in c) {
        c.cancel();
    }
}


@component("series")
export class XYSeriesCollection implements ICartesianSeriesCollection {

    public collection = array<ICartesianSeries>();
    @create(() => new SeriesGroupCollection())
    public groups: SeriesGroupCollection;

    @create
    public createSeries(settings: ICartesianSeriesSettings, globalSettings: ICartesianSeriesSettings, globalData: ISeriesTableEntry){
        return new CartesianSeries(settings, globalSettings, globalData);
    };

    @create(() => new SeriesStackManager())
    stackManager: SeriesStackManager

    @create(function(this: XYSeriesCollection){
        return normalizeSettings(this.chart.settings.series);
    })
    seriesCollectionSettings

    @create(() => new XCategoryManager())
    xCategoryManager: XCategoryManager

    @create(() => new YCategoryManager())
    yCategoryManager: YCategoryManager

    @inject
    chart: XYChart

    @inject
    chartData: variable.IVariable<ITableResults>

    constructor() {

    }

    public cancel() {
        this.collection.forEach(s => cancelIf(s));
    }

    get(series: string): ICartesianSeries {
        return <ICartesianSeries>findSeries(this.collection, series);
    }

    createGroups(){
        var proc = procedure(p => {
            var grp = this.groups;
            if (this.chart.settings.series && (<ICartesianChartSeriesConfig>this.chart.settings.series).groups){
                var grps = (<ICartesianChartSeriesConfig>this.chart.settings.series).groups;
                grp.collection.clear();
                grps.forEach(g => {
                    (<SeriesGroupCollection>grp).add(g)
                });
            }
        });
        this.chart.cancels.push(proc);
        return proc;
    }

    initSeries(){
        var lastCancel: ICancellable = nullCancellable;
        var settings = this.chart.settings;
        var series = this;
        var chartData = this.chartData;
        var proc = procedure(p => {
            lastCancel.cancel();
            var ss = settings.series;
            if (ss){
                if (Array.isArray(ss) || unobserved(() => array.isReactiveArray(ss))){
                    lastCancel = processSeries(series, {}, <any>ss, chartData);
                }
                else{
                    lastCancel = processSeries(series, <IChartXYSeriesSettings>ss, (<IChartXYSeriesSettings>ss).series || [], chartData);
                }
            }
            else{
                lastCancel = processSeries(series, {}, [], chartData);
            }
        });
        this.chart.cancels.push(proc);
        this.chart.cancels.push({
            cancel: () => {
                if (lastCancel){
                    lastCancel.cancel();
                }
            }
        });
        return proc;
    }

    @init
    public init() {
        this.createGroups();
        this.initSeries();
        this.xCategoryManager
        this.yCategoryManager
    }

    public add(series: ICartesianSeriesSettings, globalSettings: ICartesianSeriesSettings, globalData: ISeriesTableEntry): IXYSeriesSystem {
        var reactor = getReactor();
        try {
            reactor._startTransaction();
            var ser: IXYSeriesSystem;
            ser = <CartesianSeries>this.createSeries(series, globalSettings, globalData);
            var c = ser.starter.start();
            ser.cancels.push({
                cancel: () => {
                    c.cancel();
                    this.collection.remove(this.collection.array.indexOf(ser));
                }
            });
            this.collection.push(ser);
        } finally {
            reactor._endTransaction();
        }
        return ser;
    }

}

function processSeries(coll: XYSeriesCollection, global: ICartesianSeriesSettings, series: ICartesianSeriesSettings[] | array.IReactiveArray<ICartesianSeriesSettings>,
                       chartData: variable.IVariable<ITableResults>){
    var idToBaseData: any = {};
    if (chartData.value){
        var seriesBaseData = chartData.value;
        seriesBaseData.series.forEach(sbd => {
            idToBaseData[sbd.id] = sbd;
        });
    }
    if (series){
        if (Array.isArray(series)){
            var cancels: ICancellable[] = [];
            for (var i=0; i < series.length; i++){
                var serSet = series[i];
                var globalData = idToBaseData[serSet.id];
                if (globalData){
                    delete idToBaseData[serSet.id];
                }
                unobserved(() => {
                    cancels.push(coll.add(serSet, global, globalData || {data: []}));
                });
            }
            for (var id in idToBaseData){
                var globalData = idToBaseData[id];
                var sets = {
                    id: globalData.id,
                    data: globalData.data
                }
                cancels.push(coll.add(sets, global, {}));
            }
            return {
                cancel: () => {
                    cancels.forEach(c => c.cancel());
                }
            }             
        }
        else{
            var map = new HashMap<ICartesianSeriesSettings, IXYSeriesSystem>();
            var upd: ICancellable;
            var idToGlobalSeries: any = {};
            var idToAddedSeries: any = {};
            unobserved(() => {
                upd = series.onUpdateSimple({
                    init: true,
                    add: function(el, indx){
                        var globalData = idToBaseData[el.id];
                        if (globalData){
                            if (idToGlobalSeries[el.id]){
                                idToGlobalSeries[el.id].cancel();
                                delete idToGlobalSeries[el.id];
                            }                        
                        }
                        var ser = coll.add(el, global, globalData || {data: []});
                        if (el.id){
                            idToAddedSeries[el.id] = true;
                        }                        
                        map.put(el, ser);
                    },
                    remove: function(el, indx){
                        var ser = map.get(el);
                        map.remove(el);
                        ser.cancel();
                        if (el.id){
                            delete idToAddedSeries[el.id];
                        }
                    },
                    after: () => {
                        for (var sid in idToBaseData){
                            if (!idToAddedSeries[sid] && !idToGlobalSeries[sid]){
                                var globalData = idToBaseData[id];
                                var ser = coll.add({
                                    id: globalData.id,
                                    data: globalData.data
                                }, global, {});
                                idToGlobalSeries[globalData.id] = ser;
                            }
                        }
                    }
                });
            });            
            return {
                cancel: () => {
                    upd.cancel();
                    for (var k in map.objects){
                        map.objects[k].value.cancel();
                    }
                    for (var k in idToGlobalSeries){
                        idToGlobalSeries[k].cancel();
                    }
                }
            }
        }
    }
    return nullCancellable;
}

export interface ICartesianSeriesCollection extends IGroupableSeriesCollection{

    get(series: string): ICartesianSeries;
    collection: array.IReactiveArray<ICartesianSeries>;
}