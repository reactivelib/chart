/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array, procedure, variable} from "@reactivelib/reactive";
import {IDiscreteContext} from "../series/render/position/index";
import {deps, init, inject} from "../../../config/di/index";
import {MultiStarter} from "../../../config/start";
import {AxisCollection} from "../axis/collection/index";
import {hash} from "@reactivelib/core";

export function manageColumns(axes: variable.IVariable<AxisCollection>, contexts: array.IReactiveArray<IDiscreteContext>, starter: MultiStarter){
    starter.add(() => {
        return procedure(() => {
            var nr = 0;
            var it = contexts.iterator();
            var stackedContexts = [];
            var stackToContext: {[s: string]: IDiscreteContext[]} = {};
            while(it.hasNext()){
                var ctx = it.next();
                if (!ctx.shared){
                    if (ctx.stack){
                        var st = stackToContext[ctx.stack];
                        if (!st){
                            st = [];
                            stackToContext[ctx.stack] = st;
                            stackedContexts.push(st);
                            nr++;
                        }
                        st.push(ctx);
                    }
                    else {
                        stackedContexts.push([ctx]);
                        nr++;
                    }
                }
                else {
                    ctx.position = 0;
                    ctx.nr = 1;
                }
            }
            distributePos(nr, 0, stackedContexts);
        });
    });
}

function distributePos(nr: number, pos: number, s: IDiscreteContext[][]): number{
    for (var i=0; i < s.length; i++){
        var ctxs = s[i];
        for (var j = 0; j < ctxs.length; j++){
            var ctx = ctxs[j];
            ctx.position = pos;
            ctx.nr = nr;
        }
        pos++;
    }
    return pos;
}

export interface ICategoryManager{

    collection: array.IReactiveArray<IDiscreteContext>;
    add(ctx: IDiscreteContext): void;
    remove(ctx: IDiscreteContext): void;

}

export class CategoryManager implements ICategoryManager{

    public collection = array<IDiscreteContext>();

    @inject
    starter: MultiStarter

    public add(ctx: IDiscreteContext){
        this.collection.push(ctx);
    }

    public remove(ctx: IDiscreteContext){
        this.collection.remove(this.collection.indexOf(ctx));
    }


}

export class XCategoryManager extends CategoryManager{

    @inject
    r_xAxes: variable.IVariable<AxisCollection>


    @init
    init(){
        manageColumns(this.r_xAxes, this.collection, this.starter);
    }

}

export class YCategoryManager extends CategoryManager{

    @inject
    r_yAxes: variable.IVariable<AxisCollection>


    @init
    init(){
        manageColumns(this.r_yAxes, this.collection, this.starter);
    }

}