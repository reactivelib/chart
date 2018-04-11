import {hash} from "@reactivelib/core";

export interface IKeyValue<K, V>{
    key: K;
    value: V;
}

export class HashMap<K, V>{

    public objects: {[s: string]: IKeyValue<K, V>} = {};

    constructor(){ 

    }

    public put(k: K, v: V){
        this.objects[hash(k)] = {key: k, value: v};
    }

    public get(k: K) {
        var v = this.objects[hash(k)];
        if (!v){
            return null;
        }
        return v.value;
    }
    
    public remove(k: K){
        delete this.objects[hash(k)];
    }

}