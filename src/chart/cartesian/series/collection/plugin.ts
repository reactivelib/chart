/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {XYSeriesCollection} from "./index";
import {extend} from "@reactivelib/core";

export default function(facts: any){
    extend(facts.FCartesian, {
        series: () => new XYSeriesCollection()
    });
}