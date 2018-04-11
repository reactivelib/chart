/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../geometry/interval";
import {map1d} from "./index";

export const pi2 = Math.PI * 2;
export const pi05 = Math.PI * 0.5;
export const pi1 = Math.PI;
export const pi15 = Math.PI * 1.5;

export function normalizeRad(rad: number){
    var r = rad % pi2;
    if (r < 0){
        r += pi2;
    }
    return r;
}

export function radianToDegree(rad: number){
    return rad * (180 / Math.PI);
}

export function degreeToRadian(deg: number){
    return deg * (Math.PI / 180);
}

export function cartesianToPolar(x: number, y: number){

    var r = Math.sqrt(x*x + y*y)
    var angle = Math.atan2(y,x);
    return {
        radius: r,
        angle: angle
    }

}

export function polarToCartesian(angle: number, radius: number){
    return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
    }
}

export function intervalToSegmentRadiusMapper(interval: IPointInterval, radiusInterval: IPointInterval){
    var mapper = map1d(interval).to(radiusInterval).create();
    return (x: number) => normalizeRad(mapper(x));
}