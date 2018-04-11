/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ShapesDataCollectionUpdater} from "./update";
import {IPoint} from "../../../../../../geometry/point/index";
import {procedure} from "@reactivelib/reactive";
import {IXIndexedShapeDataHolder} from "./index";
import {IYIntervalData} from "../../../../../../datatypes/range";

export class StackingShapesDataCollectionUpdater<E extends IPoint> extends ShapesDataCollectionUpdater<E>{

    public recalcs: E[] = [];
    public fullRecalc = true;
    public indexStart: number;

    public update(){
        this.recalcs = [];
        super.update();
    }

    public push(val: E){
        if (!this.fullRecalc){
            this.recalcs.push(val);
        }
        super.push(val);

    }

    public shift(){
        var old = super.shift();
        if (!this.fullRecalc){
            this.recalcs.push(<E><any>old);
        }
        return old;
    }

    public unshift(val: E){
        super.unshift(val);
        if (!this.fullRecalc){
            this.recalcs.push(val);
        }
    }

    public set(index: number, val: E, old: E){
        if (!this.fullRecalc){
            this.recalcs.push(val);
        }
    }

    public indexView(start: number, end: number){
        super.indexView(start, end);
        this.indexStart = start;
    }

    public pop(){
        var old = super.pop();
        if (!this.fullRecalc){
            this.recalcs.push(<E><any>old);
        }
        return old;
    }
}

export interface IStackedPointDataHolder<E extends IPoint> extends IXIndexedShapeDataHolder<E>, IYIntervalData{
    
}

export class StackedShapesDataManager<E extends IPoint>{

    public updaters: StackingShapesDataCollectionUpdater<E>[] = [];
    public procedure: procedure.IProcedure;

    constructor(){
        this.procedure = procedure(() => {
            var recalcs: {[s: string]: E} = {};
            var fullRecalc = Number.MAX_VALUE;
            this.updaters.forEach((u, indx) => {
                u.update();
                if (fullRecalc < Number.MAX_VALUE || u.fullRecalc){
                    fullRecalc = indx;
                }
                else {
                    u.recalcs.forEach(rc => {
                        recalcs[rc.x] = rc;
                    });
                }
                u.fullRecalc = false;
            });
            fullRecalc = Math.min(this.updaters.length, fullRecalc);
            for (var k in recalcs){
                var rc = recalcs[k];
                var sum = 0;
                for (var i=0; i < fullRecalc; i++)
                {
                    var upd = this.updaters[i];
                    var coll = upd.collection;
                    var indx = coll.findOneIndex(rc.x);
                    if (indx !== null){
                        var shape = <IStackedPointDataHolder<E>>upd.shapeData.get(indx - upd.indexStart);
                        var y = (<E>coll.get(indx)).y;
                        shape.ye = sum + y;
                        shape.y = sum;
                        sum = shape.ye;
                    }
                }
            }
            var l = this.updaters.length;
            for (var i=fullRecalc; i < l; i++){
                var upd = this.updaters[i];
                if (i > 0){
                    var par = this.updaters[i - 1];
                }
                for (var j = 0; j < upd.shapeData.length; j++) {
                    var data = <IStackedPointDataHolder<E>>upd.shapeData.get(j);
                    var ys = 0;
                    var sumData = (<E>upd.collection.get(j + upd.indexStart));
                    var ye = sumData.y;
                    if (par) {
                        var indx = par.collection.findOneIndex(sumData.x);
                        if (indx !== null) {
                            var pd = <IStackedPointDataHolder<E>>par.shapeData.get(indx - par.indexStart);
                            ys = pd.ye;
                            ye = ys + ye;
                        }
                    }
                    data.ye = ye;
                    data.y = ys;
                }
            }
        });
    }

    public add(updater: StackingShapesDataCollectionUpdater<E>){
        this.updaters.push(updater);
        this.procedure.update();
    }

    public remove(updater: StackingShapesDataCollectionUpdater<E>){
        for (var i=0; i < this.updaters.length; i++){
            var upd = this.updaters[i];
            if (upd === updater){
                this.updaters.splice(i, 1);
                if (i < this.updaters.length){
                    var upd = this.updaters[Math.max(0, i - 1)];
                    if (upd){
                        upd.fullRecalc = true;
                    }
                }
                this.procedure.changedDirty();
                return;
            }
        }
    }

}