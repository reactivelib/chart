/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator} from "../../collection/iterator/index";
import {IPoint} from "../../geometry/point/index";

export interface IRandomWalkSettings{

    min: number;
    max: number;
    maxAdd?: number;
    start: number;
    end: number;
    distance: number;
    rounder?: (n: number) => number;

}

export interface IRandomWalkIterator extends IIterator<IPoint>{

    undoYChange(): void;

}

export function createRandomWalkData(settings: IRandomWalkSettings): IRandomWalkIterator{

    var xs = settings.start;
    var range = settings.max - settings.min;
    var maxAdd = "maxAdd" in settings ? settings.maxAdd : 5;
    var val = (settings.max + settings.min) / 2;
    var rounder = settings.rounder ? settings.rounder : (n: number) => n;
    var lastY = val;
    return {

        hasNext: () => {
            return xs < settings.end;
        },

        next: () => {
            var add =  Math.random() * (maxAdd + maxAdd) - maxAdd;
            lastY = val;
            val = Math.max(settings.min, Math.min(settings.max , val + add));
            var res = {
                x: xs,
                y: rounder(val)
            }
            xs += settings.distance;
            return res;
        },

        undoYChange: () => {
            val = lastY;
        }
    }
}