import {extend} from "@reactivelib/core";

export interface ArrayConfig<K, E extends K>{
    array?: E[];
    compare: (a: K, b: K) => number;
}

function comp(a: number, b: number){
    return a - b;
}

export class SortedArray<K, E extends K>{
    
    public array: E[];
    public compare: (a: K, b: K) => number;
    
    constructor(config?: E[] | ArrayConfig<K, E>){
        if (Array.isArray(config))
        {
            this.array = <E[]>config;
            this.compare = <any>comp;
        }
        else{
            extend(this, {
                array: []
            }, config);
        }
        this.array.sort(this.compare);
    }

    insert(item: E){
        var indx = this.findFirst(item) + 1;
        this.array.splice(indx, 0, item);
        return indx;

    }

    remove(item: E){
        var indx = this.find(item);
        if(indx >= 0)
        {
            this.array.splice(indx, 1);
            return indx;
        }
        return -1;

    }

    public removeByIndex(index: number): E{
        if (index >= 0 && index < this.array.length){
            var el = this.array[index];
            this.array.splice(index, 1);
            return el;
        }
        return null;
    }

    find(item: E){
        var indx = this.findFirst(item);
        var val = this.array[indx];
        while (val !== item){
            indx++;
            val = this.array[indx];
            if (this.array.length <= indx || this.compare(item, val) !== 0){
                return -1;
            }
        }
        return indx;
    }

    findByKey(key: K): number{
        var indx = this.findFirst(key);
        if (indx < 0){
            return -1;
        }
        if (this.compare(key, this.array[indx]) === 0){
            return indx;
        }
        return -1;
    }

    findFirst(value: K){
        var array = this.array;
        var startIndex = -1;
        var endIndex = array.length;
        if (endIndex === 0){
            return -1;
        }
        var end = endIndex - 1;
        var middle = startIndex;
        while(startIndex < endIndex)
        {
            middle = (startIndex + endIndex) / 2;
            middle = Math.floor(middle);
            var compare;
            if (middle < 0)
            {
                compare = 1;
            }
            else {
                compare = this.compare(array[middle], value);
            }
            if (startIndex === endIndex - 1)
            {
                if (middle === end)
                {
                    endIndex = startIndex;
                    break;
                }
                var highCompare = this.compare(array[middle+1], value);
                if (highCompare > 0)
                {
                    endIndex = startIndex;
                }
                else
                {
                    startIndex = endIndex;
                }
            }
            else
            {
                if (compare > 0)
                {
                    endIndex = middle - 1;
                }
                else if (compare < 0)
                {
                    startIndex = middle;
                }
                else
                {
                    endIndex = middle;
                }
            }
        }
        return Math.min(startIndex, end);
    }

    findLast(value: K){
        var array = this.array;
        var startIndex = -1;
        var endIndex = array.length;
        if (endIndex === 0){
            return 1;
        }
        var middle = startIndex;
        var end = endIndex - 1;
        while(startIndex < endIndex)
        {
            middle = (startIndex + endIndex) / 2;
            middle = Math.ceil(middle);
            var compare;
            if (middle > end)
            {
                compare = 1;
            }
            else
            {
                compare = this.compare(array[middle], value);
            }
            if (startIndex === endIndex - 1)
            {
                if (middle === 0)
                {
                    startIndex = endIndex;
                    break;
                }
                var compareLow = this.compare(array[middle - 1], value);
                if (compareLow < 0)
                {
                    startIndex = endIndex;
                }
                else
                {
                    endIndex = startIndex;
                }
            }
            else
            {
                if (compare < 0)
                {
                    startIndex = middle + 1;
                }
                else if (compare > 0)
                {
                    endIndex = middle;
                }
                else
                {
                    startIndex = middle;
                }
            }
        }
        return Math.max(0, endIndex);
    }
    
    get length(){
        return this.array.length;
    }
    
}

export default function sorted<K, E extends K>(config?: E[] | ArrayConfig<K, E>){
    return new SortedArray<K, E>(config);
}