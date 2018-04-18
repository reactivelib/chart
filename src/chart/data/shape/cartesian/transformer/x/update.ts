/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {
    IReactiveXSortedRingBuffer,
    ReactiveXSortedRingBuffer,
    RingbufferIntervalUpdater
} from "../../../../../reactive/collection/ring";
import {IPointInterval} from "../../../../../../geometry/interval/index";
import {IXIndexedData} from "../../../../../../datatypes/range";
import {IXIndexedShapeDataHolder} from "./index";
import {IShapeDataHolder} from "../../../transform/index";

export interface IXShapeDataRingBuffer<E extends IXIndexedData> extends IReactiveXSortedRingBuffer<IXIndexedShapeDataHolder<E>>{
    startIndexOffset: number;
}

export interface IDataTransformer{

    create(d: any): IShapeDataHolder<any>;
    update(d: any, shape: IShapeDataHolder<any>): IShapeDataHolder<any>;
    finish();


}

export class SimpleDataTransformer implements IDataTransformer{

    constructor(public create: (d: any) => IShapeDataHolder<any>){

    }

    update(d: any, shape: IShapeDataHolder<any>): IShapeDataHolder<any>{
        return this.create(d);
    }

    finish(){

    }


}

export class ShapesDataCollectionUpdater<E extends IXIndexedData>{

    constructor(public collection: IReactiveXSortedRingBuffer<E>,
                public transformer: IDataTransformer,
                public window:  () => IPointInterval){
        this.shapeData = <IXShapeDataRingBuffer<E>> <any>new ReactiveXSortedRingBuffer<IXIndexedShapeDataHolder<E>>();
        this.updater = new RingbufferIntervalUpdater(collection, this);
        this.updater.includeStart = true;
        this.updater.includeEnd = true;
    }

    public updater: RingbufferIntervalUpdater<E>;
    public shapeData: IXShapeDataRingBuffer<E>;

    public update(){
        var updater = this.updater;
        var window = this.window();
        var coll = this.collection;
        var s = window.start;
        var e = window.end;
        var data = coll;
        var smaller = data.firstSmaller(s, false);
        if (smaller > -1){
            s = data.get(smaller).x;
        }
        var bigger = data.lastBigger(e, false);
        if (bigger < data.length){
            e = data.get(bigger).x;
        }
        updater.update(s, e);
        this.transformer.finish();
    }

    public cancel(){
        this.updater.cancel();
    }

    public push(val: E){
        var data = <IXIndexedShapeDataHolder<E>>this.transformer.create(val);
        this.shapeData.push(data);
    }

    public shift(){
        return this.shapeData.shift();
    }

    public unshift(val: E){
        var data = <IXIndexedShapeDataHolder<E>>this.transformer.create(val);
        this.shapeData.unshift(data);
    }

    public set(index: number, val: E, old: E){
        var holder = this.shapeData.get(index);
        var data = <IXIndexedShapeDataHolder<E>>this.transformer.update(val, holder);
        this.shapeData.set(index, data);
    }

    public indexView(start: number, number: number){
        this.shapeData.startIndexOffset = start;
    }

    public pop(){
        return this.shapeData.pop();
    }

}