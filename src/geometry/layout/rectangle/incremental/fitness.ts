/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator} from "../../../../collection/iterator";
import {IRectangle} from "../../../rectangle/index";
import {IInterval} from "../../../interval/index";
import rectangle from '../../../rectangle';
import interval from '../../../interval';

export type AxisFit = "FIT" | "TOO_MANY" | "TOO_FEW";

export interface IAxisFitnessMeasurer{

    add(rect: IRectangle): boolean;
    finish(): boolean;

}

export interface IFitnessAndRectangles{
    rectangles: IRectangle[];
    fitness: AxisFit;
}

export class TooManyFitnessMeasurer implements IAxisFitnessMeasurer{

    private last: IRectangle = null;
    private fits = true;

    public add(rect: IRectangle): boolean{
        if (!this.last)
        {
            this.last = rect;
            return this.fits;
        }
        var ov = rectangle(this.last).isOverlappingWith(rect);
        this.fits = this.fits && !ov;
        this.last = rect;
        return this.fits;
    }

    public finish(){
        return this.fits;
    }

}

export class TooFewFitnessMeasurer implements IAxisFitnessMeasurer{

    private last: IRectangle = null;
    private fits = false;
    private nr = 0;
    public tooLowRelation = 3;

    constructor(public intervalProvider: (r: IRectangle) => IInterval){

    }

    public add(child: IRectangle){
        this.nr++;
        if (!this.last)
        {
            this.last = child;
            return true;
        }
        var ch = child;
        var maxDist = 0;
        var int = this.intervalProvider(child);
        var lastInt = this.intervalProvider(this.last);
        var maxHeight = lastInt.size;
        maxHeight = Math.max(maxHeight, int.size);
        maxDist = Math.max(maxDist, interval(lastInt).distance(int));
        this.last = ch;
        this.fits = this.fits || !(maxDist / maxHeight > this.tooLowRelation);
        return true;
    }

    public finish(){
        if (this.nr < 2){
            return false;
        }
        return this.fits;
    }
}

export interface IRectangleFitnessEstimatorSettings{
    tooMany: () => IAxisFitnessMeasurer;
    tooFew: () => IAxisFitnessMeasurer;
}

export function createFitnessAndRectanglesCalculator(settings: IRectangleFitnessEstimatorSettings): (r: IIterator<IRectangle>) => IFitnessAndRectangles{
    return function(it: IIterator<IRectangle>){
        var tooFew = settings.tooFew();
        var tooMany = settings.tooMany();
        var rects: IRectangle[] = [];
        while(it.hasNext()){
            var rect = it.next();
            rects.push(rect);
            if (!tooFew.add(rect)){
                return {
                    fitness: "TOO_FEW",
                    rectangles: rects
                }
            }
            if (!tooMany.add(rect)){
                return {
                    fitness: "TOO_MANY",
                    rectangles: rects
                }
            }
        }
        if (!tooFew.finish()){
            return {
                fitness: "TOO_FEW",
                rectangles: rects
            }
        }
        if (!tooMany.finish()){
            return {
                fitness: "TOO_MANY",
                rectangles: rects
            }
        }
        return {
            fitness: "FIT",
            rectangles: rects
        }
    }
}

