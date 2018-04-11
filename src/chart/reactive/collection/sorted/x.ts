/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {compareXData, IXSortedCollection, XSortedCollection} from "../../../../collection/sorted/data";
import {ICancellable, ICancellableIterator} from "@reactivelib/reactive";
import {RedBlackTreeSortedCollection, SortedCollectionUpdate} from "../../sorted";
import {IIterator} from "../../../../collection/iterator/index";
import {IXIndexedData} from "../../../../datatypes/range";
import {extend} from "@reactivelib/core";

/**
 * A handler that processes updates of a IReactiveXSortedCollection
 */
export interface IXSortedUpdateHandler<E extends IXIndexedData>{

    /**
     * Called when a new element is added to the collection
     * @param pt The added element
     */
    add?(pt: E): void;
    /**
     * Called when an element is removed from the collection
     * @param pt The removed element
     */
    remove?(pt: E): void;
    /**
     * Called when an element is replaced 
     * @param pt The new element added
     * @param old The old element that was removed
     */
    replace?(pt: E, old: E): void;
    /**
     * Called after all updates have been processed
     */
    after?(): void;
    /**
     * Called before any updates have been processed
     */
    before?(): void;

}

/**
 * @inheritDoc
 * 
 * This is a reactive version of the collection that can be observed when changed.
 * 
 */
export interface IReactiveXSortedCollection<E extends IXIndexedData> extends IXSortedCollection<E>{

    /**
     * Registers a news handler to process updates for this collection
     * @param handler The handler to process the updates
     * @returns a cancellable that unregisters the handler from receiving updates 
     */
    onUpdate(handler: IXSortedUpdateHandler<E>): ICancellable;
    /**
     *  @ignore 
     */
    updates(): ICancellableIterator<SortedCollectionUpdate<IXIndexedData, E>>;
    /**
     * Replaces an element with a new one
     * @param old The element to remove
     * @param data The element to add
     */
    replace(old: E, data: E): E;

}

export class ReactiveXSortedCollection<E extends IXIndexedData> implements IReactiveXSortedCollection<E>{

    public _collection = new RedBlackTreeSortedCollection<IXIndexedData, E>(compareXData);

    public add(p: E): E{
        throw new Error("Implement");
    }

    public remove(p: IXIndexedData): E{
        throw new Error("Implement");
    }
    
    public find(p: IXIndexedData): E{
        var res = this._collection.find(p);
        return res;
    }

    public replace(old: E, n: E): E{
        var rem = this._collection.tree.remove(old);
        this._collection.tree.insert(n, n);
        if (rem){
            this._collection.updater.fire({type: 3, value: n, key: old, old: old});
        }
        else {
            this._collection.updater.fire({type: 1, value: n, key: old});
        }
        this._collection.$r.changedDirty();
        return rem;
    }

    public contains(key: IXIndexedData){
        return this._collection.find(key) !== null;
    }

    public biggest(): number{
        throw new Error("Implement");
    }

    public smallest(): number{
        throw new Error("Implement");
    }

    public firstSmaller(val: number, include?: boolean): number{
        throw new Error("Implement");
    }

    public findOne(indx: number): E{
        throw new Error("Implement");
    }

    public firstBigger(val: number, include?: boolean): number{
        throw new Error("Implement");
    }

    public iterator(start?: number, startInclude?: boolean, end?: number, endInclude?: boolean): IIterator<E>{
        throw new Error("Implement");
    }

    get length(){
        return this._collection.length;
    }

    public onUpdate(handler: IXSortedUpdateHandler<E>){
        var mod = null;
        if (handler.replace){
            mod = function(n: E, i: IXIndexedData, o: E){
                handler.replace(n, o);
            }
        }
        return this._collection.onUpdate({
            after: handler.after,
            remove: handler.remove,
            modify: mod,
            add: handler.add,
            before: handler.before
        });
    }

    public updates(): ICancellableIterator<SortedCollectionUpdate<IXIndexedData, E>>{
        return this._collection.updates();
    }


}

extend(ReactiveXSortedCollection.prototype, XSortedCollection.prototype);