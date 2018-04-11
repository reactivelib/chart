/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPieChartSettings} from "./factory";
import {array, ICancellable, procedure, unobserved} from "@reactivelib/reactive";
import {IPieSeriesSettings, PieSeries} from "./series";
import {PieChart} from "./index";
import {ReactiveArrayProxyGroup} from "../render/canvas/shape/group/index";

export default function(chart: PieChart, settings: IPieChartSettings, seriesFactory: (settings: IPieSeriesSettings, globalSettings: IPieSeriesSettings) => PieSeries){
    var res = array<PieSeries>();
    var lastCancel: ICancellable;
    var proc = procedure(p => {
        res.array.forEach(a => {
            a.cancel();
        });
        res.clear();
        lastCancel && lastCancel.cancel();
        var sers = settings.series;
        unobserved(() => {
            if (Array.isArray(sers)){
                sers.forEach(s => {
                    res.push(seriesFactory(s, {}));
                });
            }
            else{
                lastCancel = sers.onUpdateSimple({
                    init: true,
                    add: (s, indx) => {
                        res.insert(indx, seriesFactory(s, {}));
                    },
                    remove: (s, indx) => {
                        var ser = res.remove(indx);
                        ser.cancel();
                    }
                });              
            }
        });
    });
    chart.cancels.push({
        cancel: () => {
            proc.cancel();
            lastCancel && lastCancel.cancel();
        }
    });
    res.onUpdateSimple({
        add: (lbl) => {

        },
        remove: (lbl) => {

        },
        init: true
    });
    return res;
}