/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointRectangle, IRectangle} from "../../../geometry/rectangle/index";
import {variable} from "@reactivelib/reactive";

export class ReactivePointRectangle implements IPointRectangle{

    private r_xs = variable(0);
    private r_xe = variable(0);
    private r_ys = variable(0);
    private r_ye = variable(0);

    get ye(){
        return this.r_ye.value;
    }

    set ye(v){
        this.r_ye.value = v;
    }

    get ys(){
        return this.r_ys.value;
    }

    set ys(v){
        this.r_ys.value = v;
    }

    get xe(){
        return this.r_xe.value;
    }

    set xe(v){
        this.r_xe.value = v;
    }

    get xs(){
        return this.r_xs.value;
    }

    set xs(v){
        this.r_xs.value = v;
    }

}

export class ReactiveRectangle implements IRectangle{
    public r_x = variable<number>(0);
    public r_y = variable<number>(0);
    public r_width = variable<number>(0);
    public r_height = variable<number>(0);

    get height(){
        return this.r_height.value;
    }

    set height(v){
        this.r_height.value = v;
    }

    get width(){
        return this.r_width.value;
    }

    set width(v){
        this.r_width.value = v;
    }

    get y(){
        return this.r_y.value;
    }

    set y(v){
        this.r_y.value = v;
    }

    get x(){
        return this.r_x.value;
    }

    set x(v){
        this.r_x.value = v;
    }
}