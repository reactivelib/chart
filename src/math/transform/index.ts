/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import createMatrix, {AffineMatrix} from "./matrix";
import {IPointRectangle} from "../../geometry/rectangle";
import {IPointInterval} from "../../geometry/interval/index";

function rotateRectangle(rect: IPointRectangle): IPointRectangle
{
    var w = rect.xe - rect.xs;
    var h = rect.ye - rect.ys;
    return {
        xs: rect.xs,
        ys: rect.ys,
        xe: rect.xs + h,
        ye: rect.ys + w
    }
}


export class MapperFactory{

    private _inverseY = false;
    private _inverseX = false;
    private _rotate: "left" | "right" = null;

    constructor(public from: IPointRectangle, public to: IPointRectangle){

    }
    public inverseY(){
        this._inverseY = true;
        return this;
    }
    public inverseX(){
        this._inverseX = true;
        return this;
    }
    public rotateLeft(){
        this._rotate = "left";
        return this;
    }
    public rotateRight(){
        this._rotate = "right";
        return this;
    }
    public create(): AffineMatrix{
        var matrix = createMatrix();
        var to = this.to;
        var from = this.from;
        if (this._rotate === "left"){
            to = rotateRectangle(to);
            matrix.translate(0, to.xe - to.xs);
            matrix.translate(to.xs, to.ys);
            matrix.rotate(-Math.PI / 2);
            matrix.translate(-to.xs, -to.ys);
        }
        else if (this._rotate === "right")
        {
            to = rotateRectangle(to);
            matrix.translate(to.ye - to.ys, 0);
            matrix.translate(to.xs, to.ys);
            matrix.rotate(Math.PI / 2);
            matrix.translate(-to.xs, -to.ys);
        }
        if (this._inverseY)
        {
            matrix.translate(to.xs, to.ys);
            matrix.translate(0, to.ye - to.ys);
            matrix.scale(1, -1);
            matrix.translate(-to.xs, -to.ys);
        }
        if (this._inverseX){
            matrix.translate(to.xs, to.ys);
            matrix.translate(to.xe - to.xs, 0);
            matrix.scale(-1, 1);
            matrix.translate(-to.xs, -to.ys);
        }
        matrix.translate(to.xs, to.ys);
        var trW = 0;
        var trH = 0;
        if (from.xe != from.xs)
        {
            trW = (to.xe - to.xs) / (from.xe - from.xs);
        }
        if (from.ys != from.ye)
        {
            trH = (to.ye - to.ys) / (from.ye - from.ys);
        }
        matrix.scale(trW, trH);
        matrix.translate(-from.xs, -from.ys);
        return matrix;
    }

}


export default function map(from: IPointRectangle) {
    return {
        to: function (to: IPointRectangle) {
            return new MapperFactory(from, to);
        }
    };
}

export function map1d(from: IPointInterval){
    return {
        to: function(to: IPointInterval){
            var f = {
                xs: 0, xe: 1, ys: from.start, ye: from.end
            };
            var t = {
                xs: 0, xe: 1, ys: to.start, ye: to.end
            };
            var conf = map(f).to(t);
            return {
                inverse: function(){
                    conf.inverseY();
                    return this;
                },
                create: function(){
                    var f = conf.create();
                    return function(val: number){
                        return f.transform(0, val).y;
                    }
                }
            }
        }
    }
}