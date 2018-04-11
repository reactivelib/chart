/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IXYSeriesData} from "../series/series";
import {ICartesianChartDataHighlightSettings} from "./data";
import {ICartesianChartSettings, XYChart} from "..";
import {procedure} from "@reactivelib/reactive";
import {IChartDataHighlighter} from "../series/render/data/highlight/highlight";
import {ICancellable, nullCancellable} from "@reactivelib/reactive";
import {IXYSeriesCollection} from "../xy/series/base";
import {MultiStarter} from "../../../config/start";
import {deps} from "../../../config/di";
import {XYSeriesCollection} from "../series/collection";

export interface ISeriesHighlightSettings{
    id: string;
    data: number[];
}

export interface ICartesianChartHighlightingSettings {
    settings: ICartesianChartDataHighlightSettings;
    series: ISeriesHighlightSettings[] | ISeriesHighlightSettings;
}

function createHighlighter(highlighter: ICartesianChartHighlightingSettings, chart: XYChart, series: XYSeriesCollection){
    var lastSets: ICartesianChartDataHighlightSettings;
    var hl: IChartDataHighlighter = null;
    var proc = procedure(p => {
        if (!hl || lastSets !== highlighter.settings){
            lastSets = highlighter.settings;
            hl = chart.createHighlighter(lastSets);                    
        }
        var data: IXYSeriesData[] = [];
        var sers = highlighter.series;
        if (Array.isArray(sers)){
            for (var i=0; i < sers.length; i++){
                var ser = sers[i];
                var seri = series.get(ser.id);
                if (seri){
                    ser.data.forEach(d => {
                        data.push({
                            series: seri,
                            index: d
                        });
                    });
                }
            }
        }
        else{
            ser = sers;
            var seri = series.get(ser.id);
            if (seri){
                ser.data.forEach(d => {
                    data.push({
                        series: seri,
                        index: d
                    });
                });
            }
        }
        hl.highlight(data);
    });
    return {
        cancel: () => {
            proc.cancel();
            hl.cancel();
        }
    }
}

export default function(settings: ICartesianChartSettings, chart: XYChart, starter: MultiStarter, series: XYSeriesCollection){
    var lastCancel: ICancellable = nullCancellable;
    starter.add(() => {
        var proc = procedure(p => {
            lastCancel.cancel();
            if (settings.highlight){
                var cancels: ICancellable[] = [];
                if (Array.isArray(settings.highlight)){
                    for (var i=0 ;i < settings.highlight.length; i++){
                        var hl = settings.highlight[i];
                        cancels.push(createHighlighter(hl, chart, series));
                    }
                    lastCancel = {
                        cancel: () => {
                            cancels.forEach(c => c.cancel());
                        }
                    }
                }
                else{
                    lastCancel = createHighlighter(settings.highlight, chart, series);
                }
            }
        });
        return {
            cancel: () => {
                proc.cancel();
                lastCancel.cancel();
            }
        }
    });    
}