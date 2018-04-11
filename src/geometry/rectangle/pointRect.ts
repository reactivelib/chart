/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointRectangle, IRectangle} from "./index";
import {IIterator} from "../../collection/iterator/index";
import {IPointInterval} from "../interval/index";

export function isOverlappingWith(r1: IPointRectangle, r2: IPointRectangle){
    var xs1 = r1.xs;
    var xe1 = r1.xe;
    var xs2 = r2.xs;
    var xe2 = r2.xe;

    var ys1 = r1.ys;
    var ye1 = r1.ye;
    var ys2 = r2.ys;
    var ye2 = r2.ye;
    return (xs1 <= xe2 && xe1 >= xs2) && (ys1 <= ye2 && ye1 >= ys2);
}

export function convertToPointRectangle(rect: IRectangle){
    return {
        xs: rect.x, ys: rect.y, xe: rect.x + rect.width, ye: rect.y + rect.height
    }
}

export class IntervalPointRectangle implements IPointRectangle{

    constructor(public widthInterval: IPointInterval, public heightInterval: IPointInterval){

    }

    get xs(){
        return this.widthInterval.start;
    }

    set xs(v){
        this.widthInterval.start = v;
    }

    get ys(){
        return this.heightInterval.start;
    }

    set ys(v){
        this.heightInterval.start = v;
    }

    get xe(){
        return this.widthInterval.end;
    }

    set xe(v){
        this.widthInterval.end = v;
    }

    get ye(){
        return this.heightInterval.end;
    }

    set ye(v){
        this.heightInterval.end = v;
    }

};

export class IndirectIntervalPointRectangle implements IPointRectangle{
    constructor(public widthInterval: () => IPointInterval, public heightInterval: () => IPointInterval){
        
    }

    get xs(){
        return this.widthInterval().start;
    }

    set xs(v){
        this.widthInterval().start = v;
    }

    get ys(){
        return this.heightInterval().start;
    }

    set ys(v){
        this.heightInterval().start = v;
    }

    get xe(){
        return this.widthInterval().end;
    }

    set xe(v){
        this.widthInterval().end = v;
    }

    get ye(){
        return this.heightInterval().end;
    }

    set ye(v){
        this.heightInterval().end = v;
    }
    
}

export class PointRectangleBackedRectangle implements IRectangle{

    constructor(public rect: IPointRectangle){

    }

    get x(){
        return this.rect.xs;
    }

    set x(x: number){
        this.rect.xs = x;
    }

    get y(){
        return this.rect.ys;
    }

    set y(v: number){
        this.rect.ys = v;
    }

    get width(){
        return this.rect.xe - this.rect.xs;
    }

    set width(w: number){
        this.rect.xe = this.rect.xs + w;
    }

    get height(){
        return this.rect.ye - this.rect.ys;
    }

    set height(h: number){
        this.rect.ye = this.rect.xs + h;
    }

}

export class RectangleBackedPointRectangle implements IPointRectangle{
    constructor(public rect: IRectangle){

    }

    get xs(){
        return this.rect.x;
    }

    set xs(x: number){
        this.rect.x = x;
    }

    get ys(){
        return this.rect.y;
    }

    set ys(v: number){
        this.rect.y = v;
    }

    get xe(){
        return this.rect.x + this.rect.width;
    }

    set xe(xe: number){
        this.rect.width = xe - this.xs
    }

    get ye(){
        return this.rect.y + this.rect.height;
    }

    set ye(ye: number){
        this.rect.height = ye - this.ys;
    }

}

export class IntervalBackedPointRectangle implements IPointRectangle{

    constructor(public x: IPointInterval, public y: IPointInterval){

    }

    get xs(){
        return this.x.start;
    }

    set xs(v: number){
        this.x.start = v;
    }

    get ys(){
        return this.y.start;
    }

    set ys(v: number){
        this.y.start = v;
    }

    get xe(){
        return this.x.end;
    }

    set xe(v: number){
        this.x.end = v;
    }

    get ye(){
        return this.y.end;
    }

    set ye(v: number){
        this.y.end = v;
    }

}


export class PointRectangleXInterval implements IPointInterval{
    constructor(public rectangle: IPointRectangle){

    }

    get start(){
        return this.rectangle.xs;
    }

    set start(s: number){
        this.rectangle.xs = s;
    }

    get end(){
        return this.rectangle.xe;
    }

    set end(v: number){
        this.rectangle.xe = v;
    }
}

export class PointRectangleYInterval implements IPointInterval{
    constructor(public rectangle: IPointRectangle){

    }

    get start(){
        return this.rectangle.ys;
    }

    set start(s: number){
        this.rectangle.ys = s;
    }

    get end(){
        return this.rectangle.ye;
    }

    set end(v: number){
        this.rectangle.ye = v;
    }
}

var nullRect = {xs: 0, ys: 0, xe: 0, ye: 0};

export function spanningFromCollection(iterator: IIterator<IPointRectangle>, def = nullRect): IPointRectangle{
    if (!iterator.hasNext()){
        return def;
    }
    var xs = Number.MAX_VALUE;
    var ys = Number.MAX_VALUE;
    var xe = -Number.MAX_VALUE;
    var ye = -Number.MAX_VALUE;
    while(iterator.hasNext()){
        var n = iterator.next();
        xs = Math.min(xs, n.xs);
        xe = Math.max(xe, n.xe);
        ys = Math.min(ys, n.ys);
        ye = Math.max(ye, n.ye);
    }
    return {xs: xs, xe: xe, ys: ys, ye: ye};
}