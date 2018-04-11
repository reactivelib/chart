/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IValueSettings} from "../../../../animation/ease/index";
import {SingleGroupAnimationEasing} from "../../../../animation/constrain";

export interface IShapeDataHolder<E>{

    data: E;

}

export class ShapeDataHolder<E> implements IShapeDataHolder<E> {

    public groupAnimation: SingleGroupAnimationEasing;
    private _y: number;
    
    set y(v: number){
        this._y = v;
    }
    
    get y(){
        return this._y;
    }
    
    constructor(public data: E){
        
    }
    
    public getGroupAnimation(){
        if (!this.groupAnimation){
            this.groupAnimation = new SingleGroupAnimationEasing();
        }
        return this.groupAnimation;
    }
    
    public init(){
        
    }
    
    public modify(data: E, changes: IValueSettings<any>[]){
        this.data = data;
    }

}