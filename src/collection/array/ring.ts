/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterable} from "../iterator/index";
import {IArrayIterator} from "../iterator/array";
import {IXIndexedData} from "../../datatypes/range";

export class RingBufferIterator<E> implements IArrayIterator<E>{
    
    public indx: number;
    public length: number;
    public index: number;
    
    constructor(public rba: RingBufferArray<E>){
        this.indx = rba.startIndex;
        this.index = -1;
        this.length = rba.length;
    }
    
    public hasNext(){
        return this.length > 0;
    }
    
    public next(){
        this.length--;
        var el = this.rba.array[this.indx];
        this.index++;
        this.indx = (this.indx+1) % this.rba.capacity;
        return el;
    }
}

/**
 * A ring buffer backed by an array. Adding or removing data at the end or start of this array is done in constant time.
 * 
 * 
 *  Usage: 
 *  
 *  ```
 *  arr.push(1)
 *  arr.push(2)
 *  
 *  arr.get(0) // returns 1
 *  arr.get(1) // returns 2
 *  
 *  arr.unshift(-1)
 *  arr.get(0) // returns -1
 *  
 *  arr.pop() // returns 2
 *  
 *  arr.shift() // returns -1
 *  
 *  arr.length // returns 1
 *  
 *  
 *  ```
 * 
 */
export interface IRingBuffer<E> extends IIterable<E>{

    /**
     * Iterator iterating over all elements in this ring buffer.
     */
    iterator(): IArrayIterator<E>;
    /**
     * The pre-allocated maximum capacity. Implementations of this interface are free to increase the capacity if an
     * element is inserted and the capacity is exceeded, or throw an exception.
     */
    capacity: number;
    /**
     * Returns the element at the given position.
     * @param index
     */
    get(index: number): E;
    /**
     * Sets the element at the given position.
     * @param index Must and index >= 0 and < @api{->length}
     * @param e
     */
    set(index: number, e: E): void;
    /**
     * Adds an element at the end of this ring buffer.
     * @param e
     */
    push(e: E): void;
    /**
     * Removes the last element in this ring buffer.
     * @returns The removed element
     */
    pop(): E;

    /**
     * Removes the first element in ths ringbuffer.
     */
    shift(): E;
    /**
     * Appends the given element at the start.
     * @param e The element to add
     */
    unshift(e: E): void;
    /**
     * The nr of elements in this ring buffer.
     */
    length: number;
}

export interface ISortedRingBuffer<E> extends IRingBuffer<E>{
    
    compare(a: E, b: E): number;
    
}

function modulo(x: number, mod: number){
    return ((x % mod) + mod) % mod;
}

export class RingBufferArray<E> implements IRingBuffer<E>{
    
    public startIndex: number = 0;
    public endIndex: number = 0;
    public array: E[];
    public length: number = 0;
    
    constructor(public capacity: number){
        this.array = [];
        this.array.length = capacity;
    }
    
    public increaseCapacity(nc: number){
        var it = this.iterator();
        var na = [];
        na.length = nc;
        var i =0;
        while(it.hasNext()){
            var val = it.next()
            na[i] = val;
            i++;
        }
        this.startIndex = 0;
        this.endIndex = this.capacity;
        this.capacity = nc;
        this.array = na;
    }
    
    public getIndex(idx: number){
        return modulo(idx, this.capacity);
    }
    
    public get(indx: number){
        return this.array[modulo(this.startIndex + indx, this.capacity)];
    }
    
    public set(indx: number, e: E){
        this.array[modulo(this.startIndex + indx, this.capacity)] = e; 
    }
    
    public push(e: E){
        if (this.capacity === this.length){
            throw new Error("Out of capacity");
        }
        this.length++;
        this.array[this.endIndex] = e;
        this.endIndex = modulo(this.endIndex + 1, this.capacity);
    }
    
    public pop(): E{
        if (this.length === 0){
            throw new Error("Array is empty");
        }
        this.length--;
        this.endIndex = modulo(this.endIndex - 1, this.capacity);
        var el = this.array[this.endIndex];
        return el;
    }
    
    public shift(): E{
        if (this.length === 0){
            throw new Error("Array is empty");
        }
        this.length--;
        var el = this.array[this.startIndex];
        this.startIndex = modulo(this.startIndex + 1, this.capacity);
        return el;
    }
    
    public unshift(e: E){
        if (this.capacity === this.length){
            throw new Error("Out of capacity");
        }
        this.length++;
        this.startIndex = modulo(this.startIndex - 1, this.capacity); 
        this.array[this.startIndex] = e;
    }
    
    public iterator(): IArrayIterator<E>{
        return new RingBufferIterator(this);
    }
    
}

export class DynamicRingBufferArray<E> implements IRingBuffer<E>{
    
    public buffer: RingBufferArray<E>;
    
    get array(){
        return this.buffer.array;
    }
    
    get startIndex(){
        return this.buffer.startIndex;
    }
    
    get endIndex(){
        return this.buffer.endIndex;
    }
    
    get capacity(){
        return this.buffer.capacity;
    }
    
    constructor(capacity = 1000){
        this.buffer = new RingBufferArray<E>(capacity);
    }
    
    public get(indx: number){
        return this.buffer.get(indx);
    }
    
    public set(indx: number, e: E){
        this.buffer.set(indx, e);
    }
    
    public push(e: E){
        if (this.buffer.length === this.buffer.capacity){
            this.buffer.increaseCapacity(this.buffer.capacity*2);
        }
        this.buffer.push(e);
    }

    public pop(): E{
        return this.buffer.pop();
    }

    public unshift(e: E){
        if (this.buffer.length === this.buffer.capacity){
            this.buffer.increaseCapacity(this.buffer.capacity*2);
        }
        this.buffer.unshift(e);
    }
    
    public shift(): E{
        return this.buffer.shift();
    }
    
    public iterator(){
        return this.buffer.iterator();
    }
    
    get length(){
        return this.buffer.length;
    }
    
}

/**
 * This is an array ringbuffer that is also sorted by the x-value of the elements it contains.
 *
 *
 * When using push, you must also guarantee that the pushed x-value is bigger or equal than the biggest value that is in the collection.
 * For unshift, the x-value must be smaller or equal than the smallest contained one.
 * When using set, the x-value must
 * be bigger or equal than the elements with smaller index and smaller or equal than the elements with a bigger index.
 */
export interface IXSortedRingBuffer<E extends IXIndexedData> extends IRingBuffer<E>{

    iterator(): IArrayIterator<E>;

    /**
     * Finds the first index of the element that has a smaller (or equal) x-value than the given x-value. If all values are bigger, returns -1.
     *
     *
     * ```javascript
     * array.push({
     * x: 1, y: 2
     * });
     * array.push({
     * x: 2, y: 4
     * });
     * array.push({
     * x: 2, y: 5
     * });
     * array.firstSmaller(2, true) // returns 1
     * array.firstSmaller(2, false) // returns 0
     *
     * ```
     *
     * @param val The x-value
     * @param include if true, finds the index that is smaller or equal. If false, finds the index that is strictly smaller
     * @returns the index position
     */
    firstSmaller(xVal: number, include?: boolean): number;
    /**
     * Finds the last index of the element that has a smaller (or equal) x-value than the given x-value. If all values are bigger, returns -1.
     *
     *
     * ```javascript
     * array.push({
     * x: 1, y: 2
     * });
     * array.push({
     * x: 2, y: 4
     * });
     * array.push({
     * x: 2, y: 5
     * });
     * array.lastSmaller(2, true) // returns 2
     * array.lastSmaller(2, false) // returns 0
     *
     * ```
     *
     * @param xVal the x-value
     * @param include if true, finds the index that is smaller or equal. If false, finds the index that is strictly smaller
     * @returns the index position
     */
    lastSmaller(xVal: number, include?: boolean): number;
    /**
     * Finds the last index of the element that has a bigger (or equal) x-value than the given x-value. If all values are smaller,
     * returns the length of this ring-buffer
     *
     *
     * ```javascript
     *
     * array.push({
     * x: 2, y: 4
     * });
     * array.push({
     * x: 2, y: 5
     * });
     * array.push({
     * x: 3, y: 2
     * });
     * array.lastBigger(2, true) // returns 1
     * array.lastBigger(2, false) // returns 2
     *
     * ```
     *
     * @param val the x-value
     * @param include if true, finds the index that is bigger or equal. If false, finds the index that is strictly bigger.
     * @returns the index position
     */
    lastBigger(xVal: number, include?: boolean): number;
    /**
     * Finds the first index of the element that has a bigger (or equal) x-value than the given x-value. If all values are smaller,
     * returns the length of this ring-buffer.
     *
     *
     * ```javascript
     *
     * array.push({
     * x: 2, y: 4
     * });
     * array.push({
     * x: 2, y: 5
     * });
     * array.push({
     * x: 3, y: 2
     * });
     * array.firstBigger(2, true) // returns 0
     * array.firstBigger(2, false) // returns 2
     *
     * ```
     *
     * @param xVal the x-value
     * @param include if true, finds the index that is bigger or equal. If false, finds the index that is strictly bigger.
     * @returns the index position
     */
    firstBigger(xVal: number, include?: boolean): number;

    /**
     * Returns one element in this collection that has the given x-value. If not found, returns null.
     * @param xVal
     */
    findOne(xVal: number): E;

    /**
     * Returns an iterator that will iterate over all elements that have an x-value in the given interval.
     * You can omit or pass null for the start and end values. In this case, iteration will start from position 0 (for omitted start)
     * and end at position @{length} - 1 (for omitted end)
     * @param start The start of the interval
     * @param includeStart if true, will include elements that have an x-value equal to the start value.
     * @param end The end of the interval
     * @param includeEnd if true, will include elements that have an x-value equal to the end value.
     */
    intervalIterator(start?: number, includeStart?: boolean, end?: number, includeEnd?: boolean): IArrayIterator<E>;

}