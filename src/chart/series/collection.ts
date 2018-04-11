/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ISeries} from "./index";
import {array} from "@reactivelib/reactive";
import {findInIterator} from "../../collection/iterator/index";
import {ISeriesGroupCollection} from "../cartesian/series/group";

/**
 * A collection containing all series of a chart
 */
export interface ISeriesCollection{
    /**
     * Returns the series with the given id, or null if not found
     * @param series
     */
    get(series: string): ISeries;
    collection: array.IReactiveArray<ISeries>;

}

export function findSeries(collection: array.IReactiveArray<ISeries>, id: string){
    return findInIterator<ISeries>(collection.iterator(), (s) => s.id === id);
}

export interface IGroupableSeriesCollection extends ISeriesCollection{

    groups: ISeriesGroupCollection;

}