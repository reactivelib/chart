/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IShapeDataHolder} from "../transform/index";
import {IReactiveRingBuffer} from "../../../reactive/collection/ring";
import {IXShapeDataRingBuffer} from "./transformer/x/update";
import {IXIndexedData} from "../../../../datatypes/range";

export interface IShapeDataProvider{

    shapeToDataIndex(index: number): number;
    dataToShapeIndex(index: number): number;
    
}

export class NormalShapeDataProvider implements IShapeDataProvider{
    
    constructor(public data: IReactiveRingBuffer<IShapeDataHolder<any>>){
        
    }

    shapeToDataIndex(index: number): number{
        return index;
    }
    
    dataToShapeIndex(index: number): number{
        return index;
    }
}

export class OffsetShapeDataProvider implements IShapeDataProvider{
    constructor(public data: IXShapeDataRingBuffer<IXIndexedData>){
        
    }

    shapeToDataIndex(index: number): number{
        return index + this.data.startIndexOffset;
    }

    dataToShapeIndex(index: number): number{
        return index - this.data.startIndexOffset;
    }
    
}