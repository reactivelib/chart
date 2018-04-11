import {IIterable, IIterator} from "./index";

export interface IIterableArray<E> extends Array<E>, IIterable<E>{

}

export class ArrayIterable<E> implements IIterable<E>{

    constructor(public array: E[]){

    }

    public iterator(){
        return new ArrayIterator(this.array);
    }

}

/**
 * An iterator over an array that also provides index information.
 */
export interface IArrayIterator<E> extends IIterator<E>{
    /**
     * Contains the index position in the array of the element that was returned by the last @api{next} call.
     */
    index: number;
}

export class ArrayIterator<E> implements IArrayIterator<E>{

    public index = 0;

    constructor(public array: E[]){
    }

    public hasNext(){
        return this.index < this.array.length;
    }

    public next(){
        var val = this.array[this.index];
        this.index++;
        return val;
    }
}

export function arrayIterator<E>(a: E[]){
    return array(a);
}

export default function array<E>(array: E[])
{
    return new ArrayIterator<E>(array);
}

export function iterable<E>(arr: E[]): IIterableArray<E>{
    (<any>arr).iterator = function(){
        return array(arr);
    }
    return <IIterableArray<E>><any>arr;
}

