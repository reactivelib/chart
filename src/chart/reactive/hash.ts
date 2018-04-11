/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {HashMap} from "../../collection/hash";
import {node} from "@reactivelib/reactive";

export class ReactiveHashMap<K, V> extends HashMap<K, V>{

    public $r = node();

    public put(k: K, v: V){
        super.put(k ,v);
        this.$r.dirty();
    }

    public get(k: K){
        this.$r.observed();
        return super.get(k);
    }

    public remove(k: K){
        super.remove(k);
        this.$r.dirty();
    }

}
