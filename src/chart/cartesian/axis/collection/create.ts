/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianChartSettings} from "../../index";
import {IChartAxisSettings} from "./factory";
import {IXYAxis, IXYAxisSettings, XYAxisSystem} from "../index";
import {extend} from "@reactivelib/core";
import {array, ICancellable, procedure, variable} from "@reactivelib/reactive";
import {AxisCollection} from "./index";
import {create, init, inject} from "../../../../config/di/index";


export class AxisCollectionCreation{

    @inject
    axes: AxisCollection

    @inject
    chartSettings: ICartesianChartSettings

    @create
    secondarySettings: array.IReactiveArray<IChartAxisSettings>
    create_secondarySettings(){
        var res = array<IChartAxisSettings>();
        var upd: ICancellable;
        var proc = procedure(p => {
            var as: IChartAxisSettings = {};
            if (this.axes.axisCoordinate === "x"){
                as = (<IChartAxisSettings>this.chartSettings.xAxis) || {};
            }
            else {
                as = (<IChartAxisSettings> this.chartSettings.yAxis) || {};
            }
            var other: IChartAxisSettings[] | array.IReactiveArray<IChartAxisSettings>;
            if (res){
                res.values.forEach((v, indx) => {
                    (<XYAxisSystem>v).cancel();
                });
                res.values = [];
            }
            if (as.secondary){
                other = as.secondary;
                if (Array.isArray(other)){
                    other.forEach((o, indx) => {
                        res.push(o);
                    });
                }
                else {
                    upd = other.onUpdateSimple({
                        init: true,
                        add: (val, indx) => {
                            res.insert(indx, val);
                        },
                        remove: (val, indx) => {
                            res.remove(indx);
                        }
                    });
                }
            }

        });
        this.axes.cancels.push({
            cancel: () => {
                proc.cancel();
                if (upd){
                    upd.cancel();
                }
            }
        });
        return res;
    }

    @create
    public r_primarySettings: variable.IVariable<IXYAxisSettings>;

    get primarySettings(){
        return this.r_primarySettings.value;
    }

    set primarySettings(v){
        this.r_primarySettings.value = v;
    }
    create_r_primarySettings(){
        var vari = variable<IXYAxisSettings>(null).listener(v => {
            var as: IChartAxisSettings = {};
            if (this.axes.axisCoordinate === "x"){
                as = (<IChartAxisSettings> this.chartSettings.xAxis) || {};
            }
            else {
                as = (<IChartAxisSettings> this.chartSettings.yAxis) || {};
            }
            var primary: IXYAxisSettings;
            if (as.primary){
                primary = <IXYAxisSettings>as.primary;
            }
            if (!primary){
                primary = extend({
                    id: "primary"
                }, as);
            }
            v.value = primary;
        });
        this.axes.cancels.push(vari.$r);
        return vari;
    }

    @create
    public r_primary: variable.IVariable<XYAxisSystem>;

    get primary(){
        return this.r_primary.value;
    }

    set primary(v){
        this.r_primary.value = v;
    }

    create_r_primary(){
        var vari =  variable<IXYAxis>(null).listener(v => {
            var res = this.axes.createAxis(this.primarySettings);
            v.value = res;
        });
        this.axes.cancels.push(vari.$r);
        return vari
    }

    @create
    secondary: array.IReactiveArray<XYAxisSystem>

    create_secondary(){
        var second = this.secondarySettings.reactiveMap({
            map: v => this.axes.createAxis(v),
            remove: (ax) => {
                (<XYAxisSystem>ax).cancel();
            }
        });
        this.axes.cancels.push({
            cancel: () => {
                second.$r.cancel();
            }
        });
        return second;
    }

}