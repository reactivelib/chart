/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ILegendComponentConfig} from "../../component/legend/index";
import {array} from "@reactivelib/reactive";
import {ISeries} from "../../../series/index";
import {IGroupableSeriesCollection} from "../../../series/collection";
import {ReactiveHashMap} from "../../../reactive/hash";
import {XYChart} from "../../index";
import {ISeriesGroup} from "../../series/group";

function removeId(map: ReactiveHashMap<string, number>, ids: array.IReactiveArray<string>, s: ISeries){
    var nr = map.get(s.id);
    nr--;
    if (nr < 1){
        map.remove(s.id);
        ids.remove(ids.array.indexOf(s.id));
    }
    else
    {
        map.put(s.id, nr);
    }
}

function insertIds(chart: XYChart, map: ReactiveHashMap<string, number>, ids: array.IReactiveArray<string>){
    return chart.series.collection.onUpdateSimple({
        add: (s) => {
            var nr = map.get(s.id);
            if (!nr){
                nr = 0;
                ids.push(s.id);
            }
            nr++;
            map.put(s.id, nr);
        },

        remove: (s) => {
            removeId(map, ids, s);
        },
        init: true
    });
}

function providerSeriesIds(chart: XYChart, settings: ILegendComponentConfig){
    if (settings.series){
        return array(settings.series);
    }
    var ids = array<string>();
    var seriesToNr = new ReactiveHashMap<string, number>();
    insertIds(chart, seriesToNr, ids);
    return ids;
}

function findRepresentingSeries(chart: XYChart, id: string){
    var s: ISeries | ISeriesGroup = chart.series.get(id);
    if (!s){
        s = (<IGroupableSeriesCollection>chart.series).groups.get(id);
    }
    return s;
}
