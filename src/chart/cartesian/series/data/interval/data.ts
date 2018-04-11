/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IReactiveXSortedRingBuffer, ReactiveXSortedRingBuffer} from "../../../../reactive/collection/ring";
import {ICartesianDataSettings} from "../../../series/series";
import {ICartesianXInterval, IIntervalData} from "../../../../../datatypes/interval";

export default function(data: ICartesianXInterval[] | IReactiveXSortedRingBuffer<ICartesianXInterval> | ICartesianDataSettings): IReactiveXSortedRingBuffer<ICartesianXInterval>{
    var coll = new ReactiveXSortedRingBuffer<ICartesianXInterval>();
    if (Array.isArray(data)){
        data.forEach((d, index) => {
            if (!("x" in d)){
                (<ICartesianXInterval>d).x = index;
            }
            coll.push(d);
        });
    }
    else if ((<ICartesianDataSettings>data).type)
    {
        var s = <ICartesianDataSettings>data;
        switch (s.type){
            default:
                throw new Error("Unknown data source type "+s.type);
        }
    }
    else {
        return <IReactiveXSortedRingBuffer<ICartesianXInterval>>data;
    }
    return coll;
}