import {IIterable, IIterator} from "../iterator/index";

export interface KeyValue<K, E>{
    key: K;
    value: E;
}

export interface ISortedCollection<K, E> extends IIterable<KeyValue<K, E>>{

    compare: (a: K, b: K) => number;
    insert(key: K, element: E, replace?: boolean): E;
    find(key: K): E;
    remove(key: K): E;
    contains(key: K): boolean;
    biggest(): KeyValue<K, E>;
    smallest(): KeyValue<K, E>;
    firstSmaller(val: K, include?: boolean): KeyValue<K, E>;
    firstBigger(val: K, include?: boolean): KeyValue<K, E>;
    clear(): ISortedCollection<K, E>;
    iterator(start?: K, startInclude?: boolean, end?: K, endInclude?: boolean): IIterator<KeyValue<K, E>>;
    length: number;

}