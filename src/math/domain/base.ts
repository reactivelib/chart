/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointRectangle} from "../../geometry/rectangle";
import {IPointInterval} from "../../geometry/interval/index";
import {PointRectangleXInterval, PointRectangleYInterval} from "../../geometry/rectangle/pointRect";

/**
 * The window is a rectangle that defines the visible portion of the data.
 */
export interface IWindow extends IPointRectangle{

    /**
     * The visible y-window of the data
     */
    yWindow: IPointInterval;
    /**
     * The visible x-window interval of the data
     */
    xWindow: IPointInterval;

}

export class Domain implements IWindow{

    constructor(public rectangle: IPointRectangle){

    }

    get xs(){
        return this.rectangle.xs;
    }

    set xs(v: number){
        this.rectangle.xs = v;
    }

    get ys(){
        return this.rectangle.ys;
    }

    set ys(v: number){
        this.rectangle.ys = v;
    }

    get xe(){
        return this.rectangle.xe;
    }

    set xe(v: number){
        this.rectangle.xe = v;
    }

    get ye(){
        return this.rectangle.ye;
    }

    set ye(v: number){
        this.rectangle.ye = v;
    }

    get yWindow(): IPointInterval{
        return new PointRectangleYInterval(this);
    }

    get xWindow(): IPointInterval{
        return new PointRectangleXInterval(this);
    }

}