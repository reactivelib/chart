/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IOptional, optional} from "@reactivelib/core";
import {AxisFit, IFitnessAndRectangles} from "./fitness";
import {IRectangle} from "../../../rectangle/index";
import {IIterator} from "../../../../collection/iterator/index";

export interface IFitnessAndRectangleCollection{
    fitness: AxisFit;
    rectangles: IRectangle[][];
}

export interface IAxisLabelsLayoutSettings{
    estimateDistance: () => IOptional<number>;
    provideRectangles: (distance: number) => IFitnessAndRectangleCollection
    more: () => number;
    less: () => number;
}

export function fitRectanglesByDistance(settings: IAxisLabelsLayoutSettings): IOptional<IRectangle[][]>{
    var lastFit = "FIT";
    var fit = "TOO_MANY";
    var first = true;
    while(fit !== "FIT"){
        if (first){
            var dist = settings.estimateDistance();
            if (!dist.present){
                return optional<IRectangle[][]>();
            }
            var ed = dist.value;
            first = false;
        }
        if (isNaN(ed) || !isFinite(ed)){
            throw new Error("Error calculating labels");
        }
        var f = settings.provideRectangles(ed);
        fit = f.fitness;
        if (fit !== "FIT") {
            if (fit === "TOO_FEW") {
                if (lastFit === "TOO_MANY") {
                    return optional<IRectangle[][]>(f.rectangles);
                }
                else {
                    var lastDist = ed;
                    ed = settings.more();
                    if (lastDist === ed) {
                        return optional(f.rectangles);
                    }
                }
            }
            else {
                var lastDist = ed
                ed = settings.less();
                if (lastDist === ed) {
                    return optional(f.rectangles);
                }
            }
            lastFit = fit;
        }
    }
    return optional(f.rectangles);
}

export function summarizeFitnessAndRectangles(rects: IIterator<IFitnessAndRectangles>): IFitnessAndRectangleCollection{
    var fitness: AxisFit = "FIT";
    var rectangles: IRectangle[][] = [];
    while(rects.hasNext()){
        var r = rects.next();
        rectangles.push(r.rectangles);
        if (r.fitness === "TOO_MANY"){
            fitness = r.fitness;
        }
        else if (r.fitness === "TOO_FEW"){
            if (fitness !== "TOO_MANY"){
                fitness = "TOO_FEW";
            }
        }
    }
    return {
        fitness: fitness,
        rectangles: rectangles
    }
}