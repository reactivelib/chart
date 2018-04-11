/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array} from "@reactivelib/reactive";
import {findInIterator, IIterator} from "../../../../../collection/iterator/index";
import {IRadiusPoint} from "../../../../../datatypes/radius";

export interface IRadiusScaleSettings{
    type?: "auto",
    maxRadius?: number;
    minRadius?: number;
    id: string;
}

export class RadiusScaleCollection{

    public collection = array<IRadiusScale>();

    public factory: (settings: IRadiusScaleSettings) => IRadiusScale
    constructor(){

    }

    public get(id: string){
        return findInIterator(this.collection.iterator(), el => el.id === id);
    }

    public add(settings: IRadiusScaleSettings){
        this.collection.push(this.factory(settings));
    }

}

export interface IRadiusScale{

    id: string;
    getRadius(val: number): number;
    
}

export interface ISeriesRadiusScaleSystem extends IRadiusScale{
    addSeries(series: () => IIterator<IRadiusPoint>): void;
    removeSeries(series: () => IIterator<IRadiusPoint>): void;
}