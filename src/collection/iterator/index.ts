export class FilteringIterator<E> implements IIterator<E>{

    private nextItem: E = undefined;

    constructor(public iterator: IIterator<E>, public filter: (e: E) => boolean){

    }

    public hasNext(){
        this.fetchNext();
        return this.nextItem !== undefined;
    }

    public next(){
        this.fetchNext();
        if (this.nextItem === undefined){
            throw new Error("No more values");
        }
        var n = this.nextItem;
        this.nextItem = undefined;
        return n;
    }

    private fetchNext(){
        if (this.nextItem === undefined){
            while(this.iterator.hasNext()){
                var item = this.iterator.next();
                if (this.filter(item)){
                    this.nextItem = item;
                    break;
                }
            }
        }
    }

}

export class IteratorWrapper<E>{
    constructor(public it: IIterator<E>){

    }

    public map<N>(mapper: (e: E) => N){
        var it = this.it;
        return {
            hasNext: function () { return it.hasNext(); },
            next: function () { return mapper(it.next()); }
        };
    }

    public filter(filter: (e: E) => boolean){
        return new FilteringIterator(this.it, filter);
    }

    public forEach(listener: (e: E) => void){
        var it = this.it;
        while(it.hasNext()){
            listener(it.next());
        }
    }
    
    public toArray(): E[]{
        var it = this.it;
        var ret = [];
        while (it.hasNext()) {
            ret.push(it.next());
        }
        return ret;
    }
    
}

export function forEachIterator<E>(it: IIterator<E>, handler: (e: E) => void){
    while(it.hasNext()){
        handler(it.next());
    }
}

export function mapIterator<E, N>(it: IIterator<E>, mapper: (e: E) => N): IIterator<N>{
    return {
        hasNext: function () { return it.hasNext(); },
        next: function () { return mapper(it.next()); }
    };
}

export function filterIterator<E>(it: IIterator<E>, f: (e: E) => boolean){
    return new FilteringIterator(it, f);
}

export function toArrayIterator<E>(it: IIterator<E>): E[]{
    var ret = [];
    while (it.hasNext()) {
        ret.push(it.next());
    }
    return ret;
}

export function findInIterator<E>(it: IIterator<E>, finder: (e: E) => boolean, def: E = null): E{
    while(it.hasNext()){
        var n = it.next();
        if (finder(n)){
            return n;
        }
    }
    return def;
}

export function iterator<E>(it: IIterator<E>){
    return new IteratorWrapper<E>(it);
}

export default iterator;

export interface IIterator<E>{
    hasNext(): boolean;
    next(): E
}

export interface IIterable<E>{
    iterator(): IIterator<E>;
}

export class IteratorsIterator<E> implements IIterator<E>{

    private lastVal: E = null;
    private lastIt: IIterator<E> = null;

    constructor(public its: IIterator<IIterator<E>>){

    }

    public hasNext(){
        this.nextVal();
        if (this.lastVal){
            return true;
        }
        return false;
    }

    public next(){
        this.nextVal();
        if (this.lastVal){
            var v = this.lastVal;
            this.lastVal = null;
            return v;
        }
        throw new Error("No more values");
    }

    private nextVal(){
        if(this.lastVal){
            return;
        }
        if (!this.lastIt){
            if (this.its.hasNext()){
                this.lastIt = this.its.next();
            }
            else
            {
                return;
            }
        }
        while(!this.lastIt.hasNext()){
            if (this.its.hasNext()){
                this.lastIt = this.its.next();
            }
            else
            {
                return;
            }
        }
        this.lastVal = this.lastIt.next();
    }

}

export function iterators<E>(its: IIterator<IIterator<E>>){
    return new IteratorsIterator<E>(its);
}

export function iterables<E>(iters: IIterable<IIterable<E>>){
    return {
        iterator: () => {
            return new IteratorsIterator<E>(iterator(iters.iterator()).map(it => it.iterator()));;
        }
    }
}