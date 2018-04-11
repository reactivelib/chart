/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {hash} from '@reactivelib/core';
import {lru} from '../../../../collection/cache/lru/index';
import {IDimension} from "../../../../geometry/rectangle/index";

export class LabelDimensionCacher<E>{

    public dataToDimensions = lru<IDimension>();

    constructor(){
        this.dataToDimensions.capacity = 1000;
    }

    public calculateLabelDimensions(data: E): IDimension{
        throw new Error("Must implement");
    }

    public getDimensions(data: E): IDimension{
        var dims = this.dataToDimensions.get(hash(data));
        if (!dims){
            dims = this.calculateLabelDimensions(data);
            this.dataToDimensions.set(hash(data), dims);
        }
        return dims;
    }

}