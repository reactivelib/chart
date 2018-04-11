/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ISortedCollection, KeyValue} from "../../collection/sorted/index";
import {RedBlackNode, RedBlackTree} from "../../collection/sorted/redblack";
import {IIterator} from "../../collection/iterator/index";
import {event, ICancellable, ICancellableIterator, IReactiveNode, node, procedure} from "@reactivelib/reactive";

export interface ISortedCollectionUpdateHandler<K, E>{

    add?(value: E, k: K): void;
    remove?(value: E, k: K): void;
    modify?(value: E, k: K, old: E): void;
    after?(): void;
    before?(): void;

}

export interface IReactiveSortedCollection<K, E> extends ISortedCollection<K ,E>{

    $r: IReactiveNode;
    onUpdate(handler: ISortedCollectionUpdateHandler<K, E>): ICancellable;
    updates(): ICancellableIterator<SortedCollectionUpdate<K, E>>;
    
}

export class ReactiveIterator<K, E> implements IIterator<KeyValue<K, E>>{

    constructor(public $r: IReactiveNode, public it: IIterator<KeyValue<K, E>>){

    }

    public hasNext(){
        this.$r.observed();
        return this.it.hasNext();
    }

    public next(){
        this.$r.observed();
        return this.it.next();
    }

}

export interface SortedCollectionUpdate<K, E>{
    type: number;
    key: K;
    value: E;
    old?: E;
}

export class ChangesIterator<K, E> implements ICancellableIterator<SortedCollectionUpdate<K, E>>{

    public queue: SortedCollectionUpdate<K, E>[] = [];
    public onCancelled = event<void>()
    public cancelled = false;
    public $r = node();

    constructor() {

    }

    public enqueue(element:  SortedCollectionUpdate<K, E>) {
        this.queue.push(element);
        this.$r.changedDirty();
    }

    public hasNext() {
        this.$r.observed();
        return this.queue.length > 0;
    }

    public next(): SortedCollectionUpdate<K, E> {
        this.$r.observed();
        return this.queue.shift();
    }

    public handleUpdates(handler: ISortedCollectionUpdateHandler<K, E>) {
        if (this.cancelled){
            return;
        }
        while (this.hasNext()) {
            var el = this.next();
            if (el.type === 1) {
                if (handler.add)
                    handler.add(el.value, el.key);
            }
            else if (el.type === 2)
            {
                if (handler.remove)
                {
                    handler.remove(el.value, el.key);
                }
            }
            else {
                    if (handler.modify){
                        handler.modify(el.value, el.key, el.old);
                    }
                }
        }
    }

    public cancel(){
        if (!this.cancelled){
            this.cancelled = true;
            this.onCancelled.fire(undefined);
        }
    }
}

export class Updater<K, E>{

    constructor(public $r: IReactiveNode, public sorted: IReactiveSortedCollection<K, E>){

    }

    protected updateListeners: ChangesIterator<K, E>[] = [];

    public fire(u: SortedCollectionUpdate<K, E>){
        for (var i=0; i < this.updateListeners.length; i++){
            this.updateListeners[i].enqueue(u);
        }
    }

    public updates() {
        var it = new ChangesIterator<K, E>();
        this.updateListeners.push(it);
        it.onCancelled.observe(() =>
        {
            this.updateListeners.splice(this.updateListeners.indexOf(it), 1);
        });
        return it;
    }

    public onUpdate(handler: ISortedCollectionUpdateHandler<K, E>) {
        var iterator = this.updates();
        var proc: procedure.IProcedure;
        var first = true;
        var handle = function(){
            if (!first){
                if(handler.before){
                    handler.before();
                }
            }
            iterator.handleUpdates(handler);
            if (!first){
                if(handler.after){
                    handler.after();
                }
            }
            first = false;
        };
        proc = procedure(function () {
            handle();
        });
        var oldCanc = proc.cancel;
        proc.cancel = function(){
            oldCanc.call(proc);
            iterator.cancel();
        };
        return proc;
    }

}


export class RedBlackTreeSortedCollection<K, E> implements IReactiveSortedCollection<K, E>{

    public tree: RedBlackTree<K, E>;
    public $r = node();
    public updater: Updater<K, E> = new Updater<K, E>(this.$r, this);

    constructor(compare: (a: K, b: K) => number){
        this.tree = this.createTree(compare);
    }

    protected createTree(compare: (a: K, b: K) => number): RedBlackTree<K, E>{
        return new RedBlackTree<K, E>(compare);
    }

    get compare(){
        return this.tree.compare;
    }

    public insert(key: K, element: E, replace?: boolean){
        var rep = this.tree.insert(key, element, replace);
        if (rep === null){
            this.updater.fire({type: 1, value: element, key: key});
        }
        else
        {
            this.updater.fire({type: 3, value: element, key: key, old: rep});
        }
        this.$r.changedDirty();
        return rep;
    }

    public biggest(){
        this.$r.observed();
        return this.tree.biggest();
    }

    public smallest(){
        this.$r.observed();
        return this.tree.smallest();
    }

    public firstBigger(key: K, include?: boolean): RedBlackNode<K, E>{
        this.$r.observed();
        return this.tree.firstBigger(key, include);
    }

    public firstSmaller(key:K, include?: boolean){
        this.$r.observed();
        return this.tree.firstSmaller(key, include);
    }

    public find(key: K): E{
        this.$r.observed();
        return this.tree.find(key);
    }

    public remove(key: K): E{
        var e = this.tree.remove(key);
        this.$r.changed();
        if (e !== null){
            this.updater.fire({type: 2, value: e, key: key});
            this.$r.dirty();
        }
        return e;
    }

    public contains(key: K): boolean{
        this.$r.observed();
        return this.tree.contains(key);
    }

    public iterator(start: K = null, is = true, end: K = null, ie = true): IIterator<KeyValue<K, E>>{
        this.$r.observed();
        return new ReactiveIterator<K, E>(this.$r, this.tree.iterator(start, is, end, ie));
    }

    get length(){
        this.$r.observed();
        return this.tree.length;
    }

    public onUpdate(handler: ISortedCollectionUpdateHandler<K, E>){
        return this.updater.onUpdate(handler);
    }

    public updates(){
        return this.updater.updates();
    }

    public clear(){
        var r = this.tree.clear();
        var it = r.iterator();
        while(it.hasNext()){
            var n = it.next();
            this.updater.fire({type: 2, value: n.value, key: n.key});
        }
        this.$r.changedDirty();
        return r;
    }

}