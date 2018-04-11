/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {DynamicRingBufferArray, IRingBuffer} from "../../../collection/array/ring";
import {array, event, IReactiveNode} from "@reactivelib/reactive";
import {ICancellable} from "@reactivelib/reactive";
import {node, getReactor} from "@reactivelib/reactive";
import {iterator} from "../../../collection/iterator/index";
import {IPointInterval} from "../../../geometry/interval/index";
import {procedure} from "@reactivelib/reactive";
import {ICancellableIterator} from "@reactivelib/reactive";
import {IArrayIterator} from "../../../collection/iterator/array";
import {IXSortedRingBuffer} from "../../../collection/array/ring";
import {IXIndexedData} from "../../../datatypes/range";
import {extend} from "@reactivelib/core";

export interface IReactiveRingBuffer<E> extends IRingBuffer<E>{
    
    /**
     * Adds an update handler that will be notified whenever the array is modified
     * @param handler
     * @return A cancellable that cancels the notifications
     */
    onUpdate(handler: array.UpdateHandler<E>): ICancellable;

    /**
     * Returns a reactive iterator that gets permanently filled with updates on this array. Must be cancelled if 
     * not used anymore.
     */
    updates(): ICancellableIterator<array.ArrayUpdate<E>>;
}

export class ArrayChangesIterator<E>{

    public queue: array.ArrayUpdate<E>[] = [];
    public onCancelled = event<any>();
    private cancelled = false;
    public $r: IReactiveNode = node();

    constructor() {

    }

    public enqueue(element: array.ArrayUpdate<E>) {
        this.queue.push(element);
        this.$r.changedDirty();
    }

    public cancel(){
        if (!this.cancelled){
            this.onCancelled.fire(null);
        }
    }

    public hasNext() {
        this.$r.observed();
        return this.queue.length > 0;
    }

    public next(): array.ArrayUpdate<E> {
        this.$r.observed();
        return this.queue.shift();
    }

    public handleUpdates(handler: array.UpdateHandler<E>) {
        while (this.hasNext()) {
            var el = this.next();
            if (el.type === "ADD") {
                if (handler.add)
                    handler.add(el.value, el.index);
            }
            else if (el.type === "REMOVE") {
                if (handler.remove)
                    handler.remove(el.value, el.index);
            }
            else
            {
                if (handler.replace){
                    handler.replace(el.value, el.index, el.old);
                }
            }
        }
    }
}

abstract class AbstractUpdater<E>{

    constructor(){

    }

    public updateListeners: ArrayChangesIterator<E>[] = [];

    public fire(u: array.ArrayUpdate<E>){
        for (var i=0; i < this.updateListeners.length; i++){
            this.updateListeners[i].enqueue(u);
        }
    }

    public updates(startFromEmptyArray = false) {
        var it = new ArrayChangesIterator<E>();
        this.updateListeners.push(it);
        it.onCancelled.observe(() =>
        {
            this.updateListeners.splice(this.updateListeners.indexOf(it), 1);
        });
        if (startFromEmptyArray) {
            this.fillCollectionEvents(it);
        }
        return it;
    }

    protected abstract fillCollectionEvents(it: ArrayChangesIterator<E>): void;

    public onUpdate(handler: array.UpdateHandler<E>) {
        var iterator = this.updates(handler.init);
        var proc: procedure.IProcedure;
        var first = true;
        var handle = function(p: procedure.IProcedure){
            if (!first){
                if (handler.before){
                    handler.before();
                }
            }
            iterator.handleUpdates(handler);
            if (!first){
                if (handler.after){
                    handler.after();
                }
            }
            first = false;
        };
        proc = procedure(function (p) {
            handle(p);
        });
        var oldCanc = proc.cancel;
        proc.cancel = function(){
            oldCanc.call(proc);
            iterator.cancel();
        };
        return proc;
    }

    public onUpdateSimple(handler: array.UpdateHandler<E>){
        var c = extend({
            replace: function(this: array.UpdateHandler<E>, el: E, indx: number, old: E){
                this.remove(old, indx);
                this.add(el, indx);
            }
        }, handler);
        return this.onUpdate(c);
    }

}

export class ArrayUpdater<E> extends AbstractUpdater<E>{

    constructor(public array: array.IReadableReactiveArray<E>){
        super();
    }

    public fillCollectionEvents(it: ArrayChangesIterator<E>){
        var l = this.array.length;
        for (var i = 0; i < l; i++) {
            it.enqueue({type: "ADD", value: this.array.get(i), index: i});
        }
    }

}

export class ReactiveRingBuffer<E> extends DynamicRingBufferArray<E> implements array.IReadableReactiveArray<E>, IReactiveRingBuffer<E>{

    public $r = node();
    
    public updater: ArrayUpdater<E> = new ArrayUpdater(this);

    public onUpdate(handler: array.UpdateHandler<E>) {
        return this.updater.onUpdate(handler);
    }

    public indexOf(el: E){
        for (var i=0; i < this.length; i++){
            var e = this.get(i);
            if (e === el){
                return i;
            }
        }
        return -1;
    }
    
    public updates(){
        return this.updater.updates();
    }
    
    get values(){
        this.$r.observed();
        return this.array;
    }

    public forEach(f: (e: E) => void){
        this.$r.observed();
        iterator(this.iterator()).forEach(f);
    }

    get array(){
        this.$r.observed();
        return this.buffer.array;
    }

    get startIndex(){
        this.$r.observed();
        return this.buffer.startIndex;
    }

    get endIndex(){
        this.$r.observed();
        return this.buffer.endIndex;
    }

    get capacity(){
        this.$r.observed();
        return this.buffer.capacity;
    }
    
    public get(indx: number){
        this.$r.observed();
        return this.buffer.get(indx);
    }

    public set(indx: number, e: E){
        var reactor = getReactor();
        try{
            reactor._startTransaction();
            var old = this.buffer.get(indx);
            this.buffer.set(indx, e);
            this.updater.fire({type: "REPLACE", value: e, index: indx, old: old});
            this.$r.changedDirty();
        }finally{
            reactor._endTransaction();
        }
        
    }

    public push(e: E){
        var reactor = getReactor();
        try{
            reactor._startTransaction();
            super.push(e);
            this.updater.fire({type: "ADD", value: e, index: this.length - 1});
            this.$r.changedDirty();
        }
        finally {
            reactor._endTransaction();
        }
    }

    public pop(): E{
        var reactor = getReactor();
        try{
            reactor._startTransaction();
            var el = this.buffer.pop();
            this.updater.fire({type: "REMOVE", value: el, index: this.length});
            this.$r.changedDirty();
            return el;
        }finally
        {
            reactor._endTransaction();
        }
    }

    public unshift(e: E){
        var reactor = getReactor();
        try{
            reactor._startTransaction();
            super.unshift(e);
            this.updater.fire({type: "ADD", value: e, index: 0});
            this.$r.changedDirty();
        }finally{
            reactor._endTransaction();
        }
    }

    public shift(): E{
        var reactor = getReactor();
        try{
            reactor._startTransaction();
            var el = this.buffer.shift();
            this.updater.fire({type: "REMOVE", value: el, index: 0});
            this.$r.changedDirty();
            return el;
        }finally{
            reactor._endTransaction();
        }
    }

    public iterator(): IArrayIterator<E>{
        this.$r.observed();
        return this.buffer.iterator();
    }

    get length(){
        this.$r.observed();
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
export interface IReactiveXSortedRingBuffer<E extends IXIndexedData> extends array.IReadableReactiveArray<E>, IReactiveRingBuffer<E>, IXSortedRingBuffer<E>{

    /**
     * @ignore
     */
    $r: IReactiveNode;

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
    
    findOneIndex(xVav: number): number;

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

function compare(x1: number, x2: number){
    return x1 - x2;
}

function compareInclude(x1: number, x2: number){
    var diff = x1 - x2;
    if(diff === 0)
    {
        return -1;
    }
    return diff;
}

function compareIncludeBigger(x1: number, x2: number){
    var diff = x1 - x2;
    if(diff === 0)
    {
        return 1;
    }
    return diff;
}

class IntervalIterator<E extends IXIndexedData> implements IArrayIterator<E>{
    
    public index: number = -1;
    
    constructor(public startIndex: number, public endIndex: number, public data: IReactiveXSortedRingBuffer<E>){
        
    }
    
    public hasNext(){
        return this.startIndex <= this.endIndex;
    }
    
    public next(){
        var el = this.data.get(this.startIndex);
        this.index = this.startIndex;
        this.startIndex++;
        return el;
    }
    
    
}

export class ReactiveXSortedRingBuffer<E extends IXIndexedData> extends ReactiveRingBuffer<E> implements IReactiveXSortedRingBuffer<E>{
    
    public compareValue(a: E){
        return a.x;
    }
    
    public intervalIterator(start: number = -Number.MAX_VALUE, includeStart = true, end = Number.MAX_VALUE, includeEnd = true): IArrayIterator<E>{
        var sindx = this.firstBigger(start, includeStart);
        var eindx = this.lastSmaller(end, includeEnd);
        return new IntervalIterator(sindx, eindx, this);
    }
    
    public findOne(xVal: number): E{
        this.$r.observed();
        var indx = this.firstSmaller(xVal, true);
        if (indx > -1){
            var r = this.get(indx);
            if (this.compareValue(r) === xVal){
                return r;
            }
            return null;
        }
        return null;
    }
    
    public findOneIndex(xVal: number): number{
        this.$r.observed();
        var indx = this.firstSmaller(xVal, true);
        if (indx > -1){
            var r = this.get(indx);
            if (this.compareValue(r) === xVal){
                return indx;
            }
            return null;
        }
        return null;
    }
    
    public firstSmaller(xVal: number, include: boolean = false): number{
        this.$r.observed();
        if (this.length === 0){
            return -1;
        }
        if (include){
            var comp = compareInclude;
        }
        else{
            comp = compare;
        }
        var s = 0;
        var e = this.length - 1;
        var sm = this._firstSmaller(xVal, s, e, comp);
        if (sm !== null){
            sm = this._firstBigger(this.compareValue(this.get(sm)), 0, sm, compareIncludeBigger);
            if (sm === null){
                return -1;
            }
        }
        else {
            return -1;
        }
        return sm;
    }
    
    public lastSmaller(xVal: number, include: boolean = false){
        this.$r.observed();
        if (this.length === 0){
            return -1;
        }
        if (include){
            var comp = compareInclude;
        }
        else{
            comp = compare;
        }
        var s = 0;
        var e = this.length - 1;
        var sm = this._firstSmaller(xVal, s, e, comp);
        if (sm === null){
            return -1;
        }
        return sm;
    }
    
    public firstBigger(xVal: number, include: boolean = false): number
    {
        this.$r.observed();
        if (this.length === 0){
            return 0;
        }
        if (include){
            var comp = compareIncludeBigger;
        }
        else {
            comp = compare;
        }
        var s = 0;
        var e  = this.length - 1;
        var sm = this._firstBigger(xVal, s, e, comp);
        if (sm === null){
            return this.length;
        }
        return sm;
    }
    
    _firstSmaller(xVal: number, s: number, e: number, comp: (e: number, n: number) => number): number{
        do{
            var mid = Math.ceil((s + e) / 2);
            var val = this.get(mid);
            var diff = comp(this.compareValue(val), xVal);
            if (diff < 0){
                s = mid;
            }
            else{
                e = mid - 1;
            }
        }while(s < e);
        diff = comp(this.compareValue(this.get(s)), xVal);
        if (diff < 0){
            return s;
        }
        return null;
    }
    
    public lastBigger(xVal: number, include: boolean = false): number{
        this.$r.observed();
        if (this.length === 0){
            return 0;
        }
        if (include){
            var comp = compareIncludeBigger;
        }
        else {
            comp = compare;
        }
        var s = 0;
        var e  = this.length - 1;
        var sm = this._firstBigger(xVal, s, e, comp);
        if (sm !== null){
            sm = this._firstSmaller(this.compareValue(this.get(sm)), sm, e, compareInclude);
            if (sm === null){
                return this.length;
            }
        }
        else{
            return this.length;
        }
        return sm;
    }

    _firstBigger(xVal: number, s: number, e: number, comp: (e: number, n: number) => number): number{
        do{
            var mid = Math.floor((s + e) / 2);
            var val = this.get(mid);
            var diff = comp(this.compareValue(val), xVal);
            if (diff > 0){
                e = mid;
            }
            else {
                s = mid + 1;
            }
        }while (s < e);
        diff = comp(this.compareValue(this.get(e)), xVal);
        if (diff > 0){
            return e;
        }
        return null;
    }
}

function identityTransform<E extends IXIndexedData>(e: E){
    return e;
}

function isInside(x: number, includeStart: boolean, includeEnd: boolean, interval: IPointInterval){
    var s = includeStart ? x >= interval.start : x > interval.start;
    var e = includeEnd ? x <= interval.end : x < interval.end;
    return s && e;
}

export interface IntervalUpdate<E extends IXIndexedData>{
    shift(): void;
    push(val: E): void;
    pop(): void;
    unshift(val: E): void;
    set(index: number, val: E, old: E): void;
    indexView(startIndex: number, endIndex: number): void;
}

export class RingbufferIntervalUpdater<E extends IXIndexedData>{
    
    public includeStart = false;
    public includeEnd = false;
    public iterator: ICancellableIterator<array.ArrayUpdate<E>>;
    public start = 0;
    public end = -1;
    public osindx = -2;
    public length: number = 0;
    
    constructor(public buffer: IReactiveXSortedRingBuffer<E>, public updates: IntervalUpdate<E>){
        this.iterator = this.buffer.updates();
    }

    public cancel(){
        this.iterator.cancel();
    }
    
    public update(start: number, end: number){
        var it = this.iterator;
        var includeStart = this.includeStart;
        var includeEnd = this.includeEnd;
        var updates = this.updates;
        var osindx = this.osindx;
        var length = this.length;
        var buffer = this.buffer;
        while (it.hasNext()){
            var n = it.next();
            var val = n.value;
            if (isInside((<ReactiveXSortedRingBuffer<E>>buffer).compareValue(val), includeStart, includeEnd, {start: this.start, end: this.end})){
                switch (n.type){
                    case "ADD":
                        if (n.index === 0){
                            updates.unshift(n.value);
                            length++;
                        }
                        else {
                            updates.push(n.value);
                            length++;
                        }
                        break;
                    case "REMOVE":
                        if (n.index === 0){
                            updates.shift();
                            length--;
                        }
                        else {
                            updates.pop();
                            length--;
                        }
                        break;
                    case "REPLACE":
                        updates.set(n.index - osindx,  n.value, n.old);
                        break;
                }
            }
            else {
                if ((<ReactiveXSortedRingBuffer<E>>buffer).compareValue(val) <= this.start){
                    if (n.type === "ADD"){
                        osindx++;
                    }
                    else if (n.type === "REMOVE"){
                        osindx--;
                    }
                }
            }
        }
        var is = start;
        var ie = end;
        var sindx = buffer.firstBigger(is, includeStart);
        var eindx = buffer.lastSmaller(ie, includeEnd);
        var oeindx = osindx + length - 1;
        if (eindx < osindx || sindx > oeindx || sindx > eindx){
            for (var i=0; i < length; i++){
                updates.pop();
            }
            for (var i=sindx; i<=eindx; i++){
                updates.push(buffer.get(i));
            }
        }
        else {
            if (osindx < sindx){
                for (var i=0; i < sindx - osindx; i++){
                    updates.shift();
                }
            }
            if (osindx > sindx){
                for (var i = osindx - 1; i >= sindx; i--){
                    updates.unshift(buffer.get(i));
                }
            }
            if (oeindx < eindx){
                for (var i=oeindx+1; i <= eindx; i++){
                    updates.push(buffer.get(i));
                }
            }
            if (oeindx > eindx){
                for (var i = eindx+1; i <= oeindx; i++){
                    updates.pop();
                }

            }
        }
        this.osindx = sindx;
        this.length = eindx - sindx + 1;
        updates.indexView(sindx, eindx);
        this.start = is;
        this.end = ie;
    }
    
}

export function createIntervalUpdates<E extends IXIndexedData>(buffer: IReactiveXSortedRingBuffer<E>, interval: IPointInterval, updates: IntervalUpdate<E>, includeStart = false, includeEnd = false){
    var it = buffer.updates();
    var osindx = -2;
    var length = 0;
    var ivl = {start: 0, end: -1};
    return procedure(() => {
        while (it.hasNext()){
            var n = it.next();
            var val = n.value;
            if (isInside(val.x, includeStart, includeEnd, ivl)){
                switch (n.type){
                    case "ADD":
                        if (n.index === 0){
                            updates.unshift(n.value);
                            length++;
                        }
                        else {
                            updates.push(n.value);
                            length++;
                        }
                        break;
                    case "REMOVE":
                        if (n.index === 0){
                            updates.shift();
                            length--;
                        }
                        else {
                            updates.pop();
                            length--;
                        }
                        break;
                    case "REPLACE":
                        updates.set(n.index - osindx,  n.value, n.old);
                        break;
                }
            }
            else {
                if (val.x <= ivl.start){
                    if (n.type === "ADD"){
                        osindx++;
                    }
                    else if (n.type === "REMOVE"){
                        osindx--;
                    }
                }
            }
        }
        var is = interval.start;
        var ie = interval.end;
        var sindx = buffer.firstBigger(is, includeStart);
        var eindx = buffer.lastSmaller(ie, includeEnd);
        var oeindx = osindx + length - 1;
        if (eindx < osindx || sindx > oeindx || sindx > eindx){
            for (var i=0; i < length; i++){
                updates.pop();
            }
            for (var i=sindx; i<=eindx; i++){
                updates.push(buffer.get(i));
            }
        }
        else {
            if (osindx < sindx){
                for (var i=0; i < sindx - osindx; i++){
                    updates.shift();
                }
            }
            if (osindx > sindx){
                for (var i = osindx - 1; i >= sindx; i--){
                    updates.unshift(buffer.get(i));
                }
            }
            if (oeindx < eindx){
                for (var i=oeindx+1; i <= eindx; i++){
                    updates.push(buffer.get(i));
                }
            }
            if (oeindx > eindx){
                for (var i = eindx+1; i <= oeindx; i++){
                    updates.pop();
                }
                
            }
        }
        osindx = sindx;
        length = eindx - sindx + 1;
        updates.indexView(sindx, eindx);
        ivl.start = is;
        ivl.end = ie;
    });
}

class SubIterator<E> implements IArrayIterator<E>{
    
    public index = -1;
    
    constructor(public buffer: IRingBuffer<E>){
        
    }
    
    public hasNext(){
        return (this.index + 1)  < this.buffer.length;
    }
    
    public next(){
        this.index++;
        return this.buffer.get(this.index);
    }
    
}

export class XSortedReactiveRingBufferSubView<E extends IXIndexedData> implements IReactiveXSortedRingBuffer<E>{
    
    public startOffset = 0;
    public endOffset = -1;
    public length = 0;
    public updater = new ArrayUpdater(this);
    public $r = node();
    
    constructor(public parent: IReactiveXSortedRingBuffer<E>){
        
    }

    public indexOf(el: E){
        this.$r.observed();
        return this.parent.indexOf(el);
    }
    
    iterator(): IArrayIterator<E>{
        this.$r.observed();
        return new SubIterator(this);
    }
    
    firstSmaller(xVal: number, include?: boolean): number{
        this.$r.observed();
        var indx = this.parent.firstSmaller(xVal, include);
        if (indx > this.endOffset){
            return this.length - 1;
        }
        if (indx >= this.startOffset){
            return indx - this.startOffset;
        }
        return -1;
        
    }
    lastSmaller(xVal: number, include?: boolean): number{
        this.$r.observed();
        var indx = this.parent.lastSmaller(xVal, include);
        if (indx > this.endOffset){
            return this.length - 1;
        }
        if (indx >= this.startOffset){
            return indx - this.startOffset;
        }
        return -1;
    }
    lastBigger(xVal: number, include?: boolean): number{
        this.$r.observed();
        var indx = this.parent.lastBigger(xVal, include);
        if (indx < this.startOffset){
            return 0;
        }
        if (indx <= this.endOffset){
            return indx - this.startOffset;
        }
        return this.length;
    }
    firstBigger(xVal: number, include?: boolean): number{
        this.$r.observed();
        var indx = this.parent.lastBigger(xVal, include);
        if (indx < this.startOffset){
            return 0;
        }
        if (indx <= this.endOffset){
            return indx - this.startOffset;
        }
        return this.length;
    }
    findOne(xVal: number): E{
        this.$r.observed();
        var indx = this.firstSmaller(xVal, true);
        if (indx > -1){
            var r = this.get(indx);
            if (r.x === xVal){
                return r;
            }
            return null;
        }
        return null;
    }

    findOneIndex(xVal: number): number{
        this.$r.observed();
        var indx = this.firstSmaller(xVal, true);
        if (indx > -1){
            var r = this.get(indx);
            if (r.x === xVal){
                return indx;
            }
            return null;
        }
        return null;
    }
    
    intervalIterator(start?: number, includeStart?: boolean, end?: number, includeEnd?: boolean): IArrayIterator<E>{
        this.$r.observed();
        var sindx = this.firstBigger(start, includeStart);
        var eindx = this.lastSmaller(end, includeEnd);
        return new IntervalIterator(sindx, eindx, this);
    }
    
    get capacity(){
        return this.parent.capacity;
    }
    get(index: number): E{
        this.$r.observed();
        index += this.startOffset;
        if (index >= this.startOffset && index <= this.endOffset){
            return this.parent.get(index);
        }
        return null;
    }
    set(index: number, e: E){
        throw new Error("Cannot modify ring buffer");
    }
    
    push(e: E): void{
        throw new Error("Cannot modify ring buffer");
    }
    
    pop(): E{
        throw new Error("Cannot modify ring buffer");
    }
    
    shift(): E{
        throw new Error("Cannot modify ring buffer");
    }
    
    unshift(e: E): void{
        throw new Error("Cannot modify ring buffer");
    }
    
    onUpdate(handler: array.UpdateHandler<E>): ICancellable{
        return this.updater.onUpdate(handler);
    }

    updates(): ICancellableIterator<array.ArrayUpdate<E>>{
        return this.updater.updates();
    }
    
    get values(): E[]{
        throw new Error("Cannot access values");
    }
    
    get array(): E[]{
        throw new Error("Cannot access array");
    }

    forEach(list: (e: E) => void): void{
        this.$r.observed();
        for (var i=this.startOffset; i<= this.endOffset; i++){
            list(this.parent.get(i));
        }
    }
    
    on_shift(){
        var val = this.get(0);
        this.length--;
        this.updater.fire({
            type: "REMOVE",
            index: 0,
            value: val
        });
        this.$r.changedDirty();
    }
    on_push(val: E){
        var l = this.length;
        this.length++;
        this.updater.fire({
            type: "ADD",
            index: l,
            value: val
        });
        this.$r.changedDirty();
    }
    on_pop(){
        var l = this.length -1;
        var val = this.get(l);
        this.length--;
        this.updater.fire({
            type: "REMOVE",
            index: l,
            value: val
        });
        this.$r.changedDirty();
    }
    on_unshift(val: E){
        this.length++;
        this.updater.fire({
            type: "ADD",
            index: 0,
            value: val
        });
        this.$r.changedDirty();
    }
    on_set(index: number, val: E, old: E){
        this.updater.fire({
            type: "REPLACE",
            index: index,
            value: val,
            old: old
        });
        this.$r.changedDirty();
    }
    on_indexView(startIndex: number, endIndex: number){
        this.startOffset = startIndex;
        this.endOffset = endIndex;
    }
}