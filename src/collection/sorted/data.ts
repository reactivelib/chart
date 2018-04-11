/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {default as iterator, IIterator} from "../iterator/index";
import {hash} from "@reactivelib/core";
import {RedBlackTree} from "./redblack";
import {IXIndexedData} from "../../datatypes/range";

/**
 * Collection storing elements indexed by the x-position. Can contain multiple elements at the same x-position.
 * 
 * 
 * Usage: 
 * ```
 * collection.add({x: 1, y: 2});
 * collection.add({x: 1, y: 3});
 * collection.add({x: 2, y: 4});
 * collection.add({x: 4, y: 6});
 * collection.add({x: 6, y: 8});
 * 
 * collection.biggest() // Returns 6
 * collection.smallest() // Return 1
 * 
 * collection.iterator() //Iterates over all elements
 * collection.iterator(1, true, 4, true) //Iterator returns [{x:1, y:2}, {x:1, y:3}, {x: 2, y: 4}, {x: 4, y: 6}]
 * collection.iterator(1, false, 4, false) //Iterator returns [{x: 2, y: 4}]
 * 
 * collection.findOne(1) // Returns either {x: 1, y:2} or {x:1, y: 3} randomly
 * 
 * collection.iterator(1, true, 1, true) //Iterator returns [{x: 1, y: 2}, {x: 1, y: 3}]
 * 
 * 
 * ```
 * 
 */
export interface IXSortedCollection<E extends IXIndexedData>{

    /**
     * Adds new data at the given x-position, e.g.:
     * 
     * ```
     * collection.add({x: 1, y: 3});
     * collection.add({x: 4, country: "italy"});
     * ```
     * 
     * @param pt The data to add
     * @returns The added data
     */
    add(pt: E): E;
    /**
     * Removes the given element from this collection, e.g.:
     * 
     * ```
     * var data = {x: 2}
     * collection.add(data);
     * ...
     * collection.remove(data);
     * ```
     * 
     * @param pt The element to remove
     * @returns The removed elements, or null if not found
     */
    remove(pt: IXIndexedData): E;
    /**
     * Returns the biggest x-index stored in this collection 
     *
     */
    biggest(): number;
    /**
     * Returns one element at the given position, or null if not data found
     * 
     * @param index The index to look for the element at
     * 
     * 
     */
    findOne(index: number): E;
    /**
     * Searches for an element that is equal to the given element and returns it if found
     * @param pt
     */
    find(pt: IXIndexedData): E;
    /**
     * 
     * Returns true if it contains the given element, false otherwise
     * 
     * @param pt The element 
     * 
     */
    contains(pt: IXIndexedData): boolean;
    /**
     * Returns the smallest x-index stored in this collection
     */
    smallest(): number;
    /**
     * Finds the first index that is smaller (or equal) the given x-value
     * @param val The index
     * @param include if true, finds the index that is smaller or equal. If false, finds the index that is strictly smaller 
     */
    firstSmaller(val: number, include?: boolean): number;
    /**
     * Finds the first index that is bigger (or equal) the given index
     * @param val the index
     * @param include if true, finds the index that is bigger or equal. If false, finds the index that is strictly bigger.
     */
    firstBigger(val: number, include?: boolean): number;
    /**
     * Returns an iterator that iterates over the elements in this collection.
     * @param start The index to start the iteration from
     * @param startInclude If true, includes the start index for the iteration, otherwise the start index is excluded
     * @param end The index to end iteration at
     * @param endInclude If true, includes the end index for iteration, otherwise the end index is excluded
     */
    iterator(start?: number, startInclude?: boolean, end?: number, endInclude?: boolean): IIterator<E>;
    /**
     * The number of elements in this collection
     */
    length: number;

}

export class SmallestKey implements IXIndexedData{
    constructor(public x: number){

    }
}

hash.setHash(SmallestKey.prototype, Number.MIN_VALUE+"");

export class BiggestKey implements IXIndexedData{
    constructor(public x: number){

    }
}

hash.setHash(BiggestKey.prototype, Number.MAX_VALUE+"");

export function compareXData(a: IXIndexedData, b: IXIndexedData){
    var c = a.x - b.x;
    if (c === 0){
        var h1 = hash(a);
        var h2 = hash(b);
        if (h1 > h2){
            return 1;
        }
        if (h1 < h2){
            return -1;
        }
        return 0;
    }
    return c;
}

export class XSortedCollection<E extends IXIndexedData> implements IXSortedCollection<E>{

    public _collection = new RedBlackTree<IXIndexedData, E>(compareXData);

    public getIndex(data: IXIndexedData){
        return data.x;
    }

    public biggestKey(val: number){
        return new BiggestKey(val);
    }

    public smallestKey(val: number){
        return new SmallestKey(val);
    }

    public add(p: E){
        var old = this._collection.insert(p, p);
        return old;
    }

    public remove(p: IXIndexedData){
        return this._collection.remove(p);
    }
    
    public find(p: E){
        return this._collection.find(p);
    }

    public biggest(){
        var b = this._collection.biggest();
        if (!b){
            return null;
        }
        return this.getIndex(b.key);
    }

    public smallest(){
        var s = this._collection.smallest();
        if (!s){
            return null;
        }
        return this.getIndex(s.key);
    }

    public firstSmaller(val: number, include?: boolean){
        var key: IXIndexedData;
        if (include){
            key = this.biggestKey(val);
        }
        else {
            key = this.smallestKey(val);
        }
        var fs = this._collection.firstSmaller(key, include);
        if (fs){
            return this.getIndex(fs.key);
        }
        return null;
    }

    public firstBigger(val: number, include?: boolean){
        var key: IXIndexedData;
        if (include){
            key = this.smallestKey(val);
        }
        else {
            key = this.biggestKey(val);
        }
        var fb = this._collection.firstBigger(key, include);
        if (fb){
            return this.getIndex(fb.key);
        }
        return null;
    }

    public iterator(start?: number, startInclude?: boolean, end?: number, endInclude?: boolean){
        var smallest: SmallestKey;
        var biggest: BiggestKey;
        if (typeof start === "number"){
            if (startInclude){
                smallest = this.smallestKey(start);
            }
            else {
                smallest = this.biggestKey(start);
            }
        }
        if (typeof end === "number"){
            if (endInclude){
                biggest = this.biggestKey(end);
            }
            else {
                biggest = this.smallestKey(end);
            }
        }
        return iterator(this._collection.iterator(smallest, startInclude, biggest, endInclude)).map(kv => kv.value);
    }

    public findOne(index: number): E{
        var it = this.iterator(index, true, index, true);
        if (it.hasNext())
        {
            return it.next();
        }
        return null;
    }

    public contains(e: IXIndexedData): boolean{
        return this._collection.find(e) !== null;
    }

    get length(){
        return this._collection.length;
    }


}