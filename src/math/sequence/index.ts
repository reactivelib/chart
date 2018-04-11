/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import rounder, {IFixedPartRounder} from "../round";
import sortedArray from "../../collection/array/sorted";
import {SortedArray} from "../../collection/array/sorted";

function calculateBase10Multiplicator(val: number) {
    if (val < 1){
        if (!(val < 0.1)){
            return 10;
        }
        else if (!(val < 0.01)){
            return 100;
        }
        else if (!(val < 0.001)){
            return 1000;
        }
        else if (!(val < 0.0001)){
            return 10000;
        }
        else if (!(val < 0.00001)){
            return 100000;
        }
        else if (!(val < 0.000001)){
            return 1000000;
        }
        else if (!(val < 0.0000001)){
            return 10000000;
        }
        else if (!(val < 0.00000001)){
            return 100000000;
        }
        else if (!(val < 0.000000001)){
            return 1000000000;
        }
        else if (!(val < 0.0000000001)){
            return 10000000000;
        }
        else if (!(val < 0.00000000001)){
            return 100000000000;
        }
        else if (!(val < 0.000000000001)){
            return 1000000000000;
        }
        else if (!(val < 0.0000000000001)){
            return 10000000000000;
        }
        else {
            return 100000000000000;
        }
    }
    else {
        var v = Math.log(val) / Math.LN10;
        var b = Math.floor(v);
        var mult = Math.pow(10, b);
        if (val / mult >= 10)
        {
            mult *= 10;
        }
        return mult;
    }
}

/**
 * Defines a sequence of items
 */
export interface ISequence<E>{
    /**
     * Returns the item that is nearest to the given item
     * @param e
     */
    nearest(e: E): E;
    /**
     * Returns the nearest item that is strictly smaller than the given item
     * @param e
     */
    previous(e: E): E;
    /**
     * Returns the nearest item that is strictly bigger than the given item
     * @param e
     */
    next(e: E): E;
}

export class RoundedSequence implements ISequence<number>{
    
    private round: IFixedPartRounder;
    private _distance: number;

    constructor(_dist: number){
        this.distance = _dist;
    }
    
    get distance(){
        return this._distance;
    }
    
    set distance(v: number){
        this.round = rounder(v);
        this._distance = v;
    }

    public nearest(position: number){
        return this.round(position);
    }

    public previous(position: number) {
        var p = this.round(position);
        if (p >= position)
        {
            return this.round(position - this.distance);
        }
        return p;
    }

    public next(position: number)
    {
        var n = this.round(position);
        if (n <= position)
        {
            var n = this.round(position + this.distance);        
            return n;
        }
        return n;
    }
}

export class ListSequence implements ISequence<number>{
    
    public list: SortedArray<number, number>;
    
    constructor(l: number[]){
        this.list = sortedArray<number, number>(l);
    }

    public nearest(n: number){
        var next = this.next(n);
        var previous = this.previous(next);
        if (Math.abs(n - next) < Math.abs(n - previous)){
            return next;
        }
        return previous;
    }

    public next(n: number){
        var i = this.list.findLast(n);
        if (this.list.array[i] === n){
            i++;
        }
        return this.list.array[Math.min(this.list.array.length - 1, i)];
    }

    public previous(n: number){
        var i = this.list.findFirst(n);
        if (this.list.array[i] === n){
            i--;
        }
        return this.list.array[Math.max(0, i)];
    }

    public compare(a: number, b: number){
        return a - b;
    }
}

export class Base10ListSequence implements ISequence<number>{

    public listSequence: ListSequence;
    public smallest: number;
    public biggest: number;
    
    
    constructor(list: number[]){
        this.listSequence = new ListSequence(list);
        var arr = this.listSequence.list.array;
        this.smallest = arr[0];
        this.biggest = arr[arr.length - 1];
    }

    public nearest(n: number){
        var next = this.next(n);
        var prev = this.previous(next);
        if (Math.abs(next - n) < Math.abs(prev - n))
        {
            return next;
        }
        return prev;
    }

    public next(n: number){
        if (n === 0){
            return 0;
        }
        var s: number;
        if (n > 0){
            s = 1;
        }
        else
        {
            s = -1;
        }
        n = Math.abs(n);
        var mult = calculateBase10Multiplicator(n);
        if (n > 1){
            var v = n / mult;
            var next = this.listSequence.next(v);
            if (next <= v)
            {
                mult *= 10;
                next = this.smallest;
            }
            return s*(mult * next);
        }
        else {
            v = n * mult;
            var next = this.listSequence.next(v);
            if (next <= v)
            {
                mult /= 10;
                next = this.smallest;
            }
            return s* (next / mult);
        }

    }

    public previous(n: number)
    {
        if (n === 0){
            return 0;
        }
        var s: number;
        if (n > 0){
            s = 1;
        }
        else
        {
            s = -1;
        }
        n = Math.abs(n);
        var mult = calculateBase10Multiplicator(n);
        if (n > 1){
            var v = n / mult;
            var next = this.listSequence.previous(v);
            if (next >= v)
            {
                mult /= 10;
                next = this.biggest;
            }
            return s* (mult * next);
        }
        else {
            v = n * mult;
            var next = this.listSequence.previous(v);
            if (next >= v)
            {
                mult *= 10;
                next = this.biggest;
            }
            return s * (next / mult);
        }

    }

    public compare(a: number, b: number){
        return a - b;
    }

}

export function rounded(distance: number){
    return new RoundedSequence(distance);
}

export function list(l: number[]){
    return new ListSequence(l);
}

export function base10List(l: number[]){
    return new Base10ListSequence(l);
}