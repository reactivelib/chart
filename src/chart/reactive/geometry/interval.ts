/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IInterval, IPointInterval} from "../../../geometry/interval/index";
import {procedure, variable} from "@reactivelib/reactive";

export class ReactiveInterval implements IInterval{

    private r_start = variable(1);
    private r_size = variable(10);

    get size(){
        return this.r_size.value;
    }

    set size(v: number){
        this.r_size.value = v;
    }

    get start(){
        return this.r_start.value;
    }

    set start(v: number){
        this.r_start.value = v;
    }

}

export class ReactivePointInterval implements IPointInterval{

    public r_start: variable.IVariable<number> = variable(1);
    public r_end = variable(10);

    get end(){
        return this.r_end.value;
    }

    set end(v){
        this.r_end.value = v;
    }

    get start(){
        return this.r_start.value;
    }

    set start(v){
        this.r_start.value = v;
    }
}

export function reactivePointInterval(func: () => IPointInterval){
    var ivl = new ReactivePointInterval();
    procedure(() => {
        var i = func();
        ivl.start = i.start;
        ivl.end = i.end;
    });
    return ivl;
}