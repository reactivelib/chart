/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {AbstractSeries, ISeries, ISeriesSettings} from "../../series";
import {IValuePoint} from "../../../datatypes/value";
import {IReactiveRingBuffer, ReactiveRingBuffer} from "../../reactive/collection/ring";
import {variable, unobserved} from "@reactivelib/reactive";
import {IRenderedPieDonut} from "./render";
import {create, inject} from "../../../config/di";
import {ICancellable} from "@reactivelib/reactive/src/cancellable";
import render from './render';
import {PieChart} from "../index";
import {IPieSeriesDataSettings, parseData} from './data';

export type NumberOrPoint = number | IValuePoint;

export interface IPieSeriesSettings extends ISeriesSettings{

    data?: NumberOrPoint[] | IReactiveRingBuffer<IValuePoint> | IPieSeriesDataSettings;

}

export interface IPieSeries extends ISeries{

    settings: IPieSeriesSettings;

}

export class PieSeries extends AbstractSeries implements IPieSeries{

    public renderedShapes: IRenderedPieDonut[] = [];

    constructor(public settings: IPieSeriesSettings, public globalSettings: IPieSeriesSettings){
        super(settings, globalSettings);
    }

    @inject
    chart: PieChart

    @inject
    colorProvider: any

    @create(function(this: PieSeries){
        return render(this, this.r_data, this.chart.settings, this.chart.center, this.colorProvider, this.chart);
    })
    renderer


    @create(function(this: PieSeries){
        var lastCancel: ICancellable;
        var res = variable<IReactiveRingBuffer<IValuePoint>>(null).listener(v => {
            var data = this.settings.data || this.globalSettings.data || [];
            unobserved(() => {
                var res: IReactiveRingBuffer<IValuePoint> = new ReactiveRingBuffer<IValuePoint>();
                if (Array.isArray(data)){
                    for (var i=0; i < data.length; i++){
                        var val = data[i];
                        if (typeof val === "number"){
                            val = {y: val};
                        }
                        res.push(val);
                    }
                }
                else if ("content" in data){
                    res = parseData(data);
                }
                else{
                    res = <IReactiveRingBuffer<IValuePoint>>data;
                }
                v.value = res;
            });
        });
        this.cancels.push({
            cancel: () => {
                res.$r.cancel();
                lastCancel && lastCancel.cancel();
            }
        });
        return res;
    })
    public r_data: variable.IVariable<IReactiveRingBuffer<IValuePoint>>;
    get data(){
        return this.r_data.value;
    }
    set data(v){
        this.r_data.value = v;
    }

    public r_startRadius = variable<number>(0);
    get startRadius(){
        return this.r_startRadius.value;
    }
    set startRadius(v){
        this.r_startRadius.value = v;
    }

    public r_endRadius = variable<number>(0);
    get endRadius(){
        return this.r_endRadius.value;
    }
    set endRadius(v){
        this.r_endRadius.value = v;
    }

}