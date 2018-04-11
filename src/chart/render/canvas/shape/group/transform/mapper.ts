/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ITransformation} from "../../../../../../math/transform/matrix";
import {IPointRectangle} from "../../../../../../geometry/rectangle/index";
import {IPointInterval} from "../../../../../../geometry/interval/index";
import {IValueTransformer, linearTransformer} from "../../../../../../math/transform/interval";
import {PointRectangleXInterval, PointRectangleYInterval} from "../../../../../../geometry/rectangle/pointRect";
import {IPoint} from "../../../../../../geometry/point/index";
import {IOptional, optional} from "@reactivelib/core";
import {Log10Transformer} from "../../../../../../math/transform/log";
import {log10} from "../../../../../../math/log";

/**
 * The origin position of the axis on the screen when looking at the positive part of the axis.
 * 
 * 
 * |position|description|
 * |--|--|
 * |"left"|Axis coordinates increase from left to right|
 * |"right"|Axis coordinates increase from right to left|
 * |"bottom"|Axis coordinates increase from bottom to top|
 * |"top"|Axis coordinates increase from top to bottom|
 */
export type CoordinateOrigin = "left" | "right" | "bottom" | "top";

class ReverseYInterval implements IPointInterval{
    constructor(public rect: IPointRectangle){
        
    }
    
    get start(){
        return this.rect.ye;
    }
    
    get end(){
        return this.rect.ys;
    }
    
}

class ReverseXInterval implements IPointInterval{
    constructor(public rect: IPointRectangle){

    }

    get start(){
        return this.rect.xe;
    }

    get end(){
        return this.rect.xs;
    }

}

export function createValueMapperFactory(origin: CoordinateOrigin, log = false): IValueMapperFactory{
    switch(origin){
        case "bottom":
            return (domain: IPointInterval, range: IPointRectangle) => {
                if (log){
                    var m: IValueTransformer =  new Log10Transformer(linearTransformer({start: log10(domain.start), end: log10(domain.end)}, new ReverseYInterval(range)));
                    
                }
                else {
                    m = linearTransformer(domain, new ReverseYInterval(range));
                }
                return m;
            }
        case "left":
            return (domain: IPointInterval, range: IPointRectangle) => {
                if (log){
                    m =  new Log10Transformer(linearTransformer({start: log10(domain.start), end: log10(domain.end)}, new PointRectangleXInterval(range)));
                }
                else
                {
                    var m: IValueTransformer = linearTransformer(domain, new PointRectangleXInterval(range));
                }
                return m;
            }
        case "top":
            return (domain: IPointInterval, range: IPointRectangle) => {
                if (log){
                    var m: IValueTransformer =  new Log10Transformer(linearTransformer({start: log10(domain.start), end: log10(domain.end)}, new PointRectangleYInterval(range)));

                }
                else {
                    m = linearTransformer(domain, new PointRectangleYInterval(range));
                }
                return m;
            }
        case "right":
            return (domain: IPointInterval, range: IPointRectangle) => {
                if (log){
                    m =  new Log10Transformer(linearTransformer({start: log10(domain.start), end: log10(domain.end)}, new ReverseXInterval(range)));
                }
                else
                {
                    var m: IValueTransformer = linearTransformer(domain, new ReverseXInterval(range));
                }
                return m;
            }
    }
}

export type IMapperFactory = (domain: IPointRectangle, range: IPointRectangle) => ITransformation;
export type IValueMapperFactory = (domain: IPointInterval, range: IPointRectangle) => IValueTransformer;

class PointMapper implements ITransformation{
    
    constructor(public x: IValueTransformer, public y: IValueTransformer){
        
    }
    
    transform(x: number, y: number): IPoint{
        return {
            x: this.x.transform(x),
            y: this.y.transform(y)
        }
    }

    transformRef(x: number, y: number, ref: IPoint){
        ref.x = this.x.transform(x);
        ref.y = this.y.transform(y);
    }

    inverse(): IOptional<ITransformation>{
        var xinv = this.x.inverse();
        if (!xinv.present){
            return optional();
        }
        var yinv = this.y.inverse();
        if (!yinv.present){
            return optional();
        }
        return optional(new PointMapper(xinv.value, yinv.value));
    }
    copy(): ITransformation{
        return new PointMapper(this.x.copy(), this.y.copy());
    }
    
    isEqual(v: PointMapper){
        return v.x === this.x && v.y === this.y;
    }
    
}

export class XYExchangedPointMapper implements ITransformation{
    constructor(public x: IValueTransformer, public y: IValueTransformer){

    }

    transformRef(x: number, y: number, ref: IPoint){
        ref.x = this.x.transform(x);
        ref.y = this.y.transform(y);
    }

    transform(x: number, y: number): IPoint{
        return {
            y: this.x.transform(x),
            x: this.y.transform(y)
        }
    }
    inverse(): IOptional<ITransformation>{
        var xinv = this.x.inverse();
        if (!xinv.present){
            return optional();
        }
        var yinv = this.y.inverse();
        if (!yinv.present){
            return optional();
        }
        return optional(new XYExchangedInversePointMapper(xinv.value, yinv.value));
    }
    copy(): ITransformation{
        return new XYExchangedPointMapper(this.x.copy(), this.y.copy());
    }

    isEqual(v: PointMapper){
        return v.x === this.x && v.y === this.y;
    }
}

export class XYExchangedInversePointMapper implements ITransformation{
    constructor(public x: IValueTransformer, public y: IValueTransformer){

    }

    transform(x: number, y: number): IPoint{
        return {
            x: this.x.transform(y),
            y: this.y.transform(x)
        }
    }

    transformRef(x: number, y: number, ref: IPoint){
        ref.x = this.x.transform(x);
        ref.y = this.y.transform(y);
    }

    inverse(): IOptional<ITransformation>{
        var xinv = this.x.inverse();
        if (!xinv.present){
            return optional();
        }
        var yinv = this.y.inverse();
        if (!yinv.present){
            return optional();
        }
        return optional(new XYExchangedPointMapper(xinv.value, yinv.value));
    }
    copy(): ITransformation{
        return new XYExchangedInversePointMapper(this.x.copy(), this.y.copy());
    }

    isEqual(v: PointMapper){
        return v.x === this.x && v.y === this.y;
    }
}


export function createPointRectangleMapper(x: IValueTransformer, y: IValueTransformer): ITransformation{
    return new PointMapper(x, y);
}