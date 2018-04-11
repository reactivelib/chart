/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../geometry/interval/index";
import {IPointRectangle} from "../../geometry/rectangle/index";
import {PointRectangleXInterval, PointRectangleYInterval} from "../../geometry/rectangle/pointRect";
import animateObject from '../../animation/object';
import {extend} from "@reactivelib/core";

export function moveWindow(window: IPointInterval, maxDomain: IPointInterval, diff: number, animate = false){
    if (diff > 0){
        var e = window.end;
        var me = maxDomain.end;
        diff = Math.min(diff, Math.max(0, me - e));
    }
    else if (diff < 0)
    {
        diff = Math.max(diff, Math.min(0, maxDomain.start - window.start));
    }
    if (animate){
        animateObject({
            duration: 300,
            from: window,
            to: {
                start: window.start + diff,
                end: window.end + diff
            }
        });
    }
    else
    {
        window.start += diff;
        window.end += diff;
    }
}

export interface IWindowChanger{

    changeX(start: number, end: number, animate?: boolean, animationOptions?: any): void;
    changeY(start: number, end: number, animate?: boolean, animationOptions?: any): void;
    moveX(diff: number, animate?: boolean): void;
    moveY(diff: number, animate?: boolean): void;

}

export class ConstrainedDomainChanger implements IWindowChanger{

    constructor(public window: IPointRectangle, public maxWindow: IPointRectangle){

    }

    changeX(start: number, end: number, animate?: boolean, options?: any){
        change(new PointRectangleXInterval(this.window), new PointRectangleXInterval(this.maxWindow), start, end, animate, options);
    }

    changeY(start: number, end: number, animate?: boolean, options?: any){
        change(new PointRectangleYInterval(this.window), new PointRectangleYInterval(this.maxWindow), start, end, animate, options);
    }
    
    public moveX(diff: number, animate?: boolean){
        moveWindow(new PointRectangleXInterval(this.window), new PointRectangleXInterval(this.maxWindow), diff, animate);
    }
    
    public moveY(diff: number, animate?: boolean){
        moveWindow(new PointRectangleYInterval(this.window), new PointRectangleYInterval(this.maxWindow), diff, animate);
    }

}

function change(ivl: IPointInterval, max: IPointInterval, ns: number, ne: number, animate = false, options = {}){
    var diff = ne - ns;
    if (ns < max.start){
        ns = max.start;
        if (ne <= ns){
            ne = ns + diff;
        }
    }
    if (ne > max.end){
        ne = max.end;
        if(ns >= ne){
            ns = ns - diff;
        }
    }
    if (ne < ns){
        var e = ne;
        ne = ns;
        ns = e;
    }
    if (animate){
        animateObject(extend({
            duration: 300,
            from: ivl,
            to: {
                start: ns,
                end: ne
            }
        }, options))
    }
    else {
        ivl.start = ns;
        ivl.end = ne;
    }
}