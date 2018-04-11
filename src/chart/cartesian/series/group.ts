/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array, ICancellable} from "@reactivelib/reactive";
import {ISeries} from "../../series/index";
import {default as color, IColor} from "../../../color/index";
import {findInIterator, IIterator} from "../../../collection/iterator/index";
import {ICartesianSeries} from "./series";

var defaultColor = color("rgb(0, 0, 0)");

export interface ISeriesGroup{
    series: array.IReactiveArray<ISeries>;
    id: string;
    label: string;
    color: IColor;
}

export class SeriesGroup implements ISeriesGroup{

    public id: string;
    public label: string;
    public series = array<ISeries>();
    private _color: IColor;

    set color(color: IColor){
        this._color = color;
    }

    get color(){
        if (this._color){
            return this._color;
        }
        if (this.series.length > 0){
            return this.series.get(0).color;
        }
        return defaultColor;
    }

    public highlight(){
        var cancels: ICancellable[] = [];
        this.series.forEach(s => {
            if ((<ICartesianSeries>s).highlight){
                cancels.push((<ICartesianSeries>s).highlight());
            }
        });
        return {
            cancel: () => {
                cancels.forEach(c => c.cancel());
            }
        }
    }

}

export interface ISeriesGroupable extends ISeries{
    group: ISeriesGroup;
}

export interface ISeriesGroupableSettings{
    group?: string;
}

/**
 * Defines a series group. A series group can be used to apply certain actions to all members of this group.
 * 
 * 
 * For example, you can define a series group in the legend of the chart. Hovering over the legend item will then
 * highlight all series that are member of this group.
 */
export interface ISeriesGroupSettings{
    /**
     * This id of this group
     */
    id: string;
    /**
     * An optional label that is used by other components, like the legend. If not defined, the id will be used.
     */
    label?: string;
    /**
     * An optional color. If not given, the color of the first series in this group will be used.
     */
    color?: string;
}

/**
 * Create a new group with given settings
 * @param {ISeriesGroupSettings | string} settings settings or name of the group
 * @returns {ISeriesGroup} the group
 */
export function createGroup(settings: ISeriesGroupSettings | string): ISeriesGroup{
    if (typeof settings === "string"){
        settings = {id: settings};
    }
    var grp = new SeriesGroup();
    grp.id = settings.id;
    if ("label" in settings){
        grp.label = settings.label;
    }
    else
    {
        grp.label = grp.id;
    }
    if ("color" in settings){
        grp.color = color(settings.color);
    }
    return grp;
}

/**
 * Find the group with the given name
 * @param {IIterator<ISeriesGroup>} groups
 * @param {string} id
 * @returns {ISeriesGroup}
 */
export function findGroup(groups: IIterator<ISeriesGroup>, id: string){
    return findInIterator(groups, (g) => g.id === id);
}

/**
 * Find the group with given name, and create it if nt does not exist
 * @param {IReactiveArray<ISeriesGroup>} groups
 * @param {string} grp
 * @returns {ISeriesGroup}
 */
export function findOrCreateGroup(groups: array.IReactiveArray<ISeriesGroup>, grp: string){
    var g = findGroup(groups.iterator(), grp);
    if (!g){
        g = createGroup(grp);
        groups.push(g);
    }
    return g;
}

export interface ISeriesGroupCollection{
    collection: array.IReactiveArray<ISeriesGroup>;
    get(id: string): ISeriesGroup;
}

export class SeriesGroupCollection implements ISeriesGroupCollection{

    public collection = array<ISeriesGroup>();
    public createGroup = createGroup;

    public add(settings: ISeriesGroupSettings | string): ISeriesGroup{
        var g = this.createGroup(settings);
        this.collection.push(g);
        return g;
    }

    public get(id: string): ISeriesGroup{
        return findGroup(this.collection.iterator(), id);
    }

}