/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {variable as rvar} from "@reactivelib/reactive";
import {IPoint} from "../../../geometry/point/index";
import {extend} from "@reactivelib/core";

export class ReactivePoint implements IPoint{

    private r_x = rvar(0);
    private r_y = rvar(0);

    get y(){
        return this.r_y.value;
    }

    set y(v: number){
        this.r_y.value = v;
    }

    get x(){
        return this.r_x.value;
    }

    set x(v: number){
        this.r_x.value = v;
    }

}

export interface IReactivePointPartial extends IPoint{
    r_x: rvar.IVariable<number>;
    r_y: rvar.IVariable<number>;
}

export function asReactivePoint(pt: any){
    extend(pt, ReactivePoint.prototype);
    return function(self: IReactivePointPartial){
        self.r_x = rvar(0);
        self.r_y = rvar(0);
    }
}