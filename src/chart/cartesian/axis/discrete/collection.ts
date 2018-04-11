/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICategory} from '../index';
import {IXSortedRingBuffer} from '../../../../collection/array/ring';
import {CartesianSeries} from '../../series/series';
import {IReactiveXSortedRingBuffer} from '../../../reactive/collection/ring';

export interface ICategoryCollection{
    getByIndex(index: number): ICategory;
    get(indx: number): ICategory;
    length: number;
}

export class ManualCategoryCollection implements ICategoryCollection{

    constructor(public collection: IXSortedRingBuffer<ICategory>){

    }

    public getByIndex(index: number): ICategory{
        return this.collection.findOne(index);
    }
    
    public get(indx: number): ICategory{
        return this.collection.get(indx);
    }

    get length(){
        return this.collection.length;
    }

}

export class SeriesCategoryCollection implements ICategoryCollection{

    constructor(public series: CartesianSeries){

    }

    public getByIndex(index: number): ICategory{
        var ser = this.series;
        if (ser){
            var data = (<IReactiveXSortedRingBuffer<any>> ser.data).findOne(index);
            if (data){
                if (data.cat){
                    return {
                        x: index,
                        id: data.cat                        
                    }
                }                
            }
        }
        return null;
    }

    public get(index: number): ICategory{
        var ser = this.series;
        if (ser){
            var data = ser.data.get(index);
            if (data){
                if (data.cat){
                    return {
                        x: index,
                        id: data.cat                        
                    }
                }                
            }
        }
        return null;
    }

    get length(){
        var ser = this.series;
        if (ser){
            return ser.data.length;
        }
        return 0;
    }

}

export class DefaultCategoryCollection implements ICategoryCollection{
    getByIndex(index: number){
        return {
            x: index,
            id: index+""
        }
    }

    get(indx: number){
        return this.getByIndex(indx);
    }

    get length(){
        return 0;
    }
}