import {list, IListNode, IList} from "@reactivelib/core";

interface LRUNode<E> extends IListNode<E>{
    key: string;
}

export class LRU<E>{
    
    public list: IList<E> = list<E>();
    public map: {[s: string]: IListNode<E>} = {};
    public capacity = 1000;

    public set(key: string, value: E){
        if (!(key in this.map)){
            if (this.list.size > this.capacity - 1){
                var nr = <LRUNode<E>>this.list.last.previous;
                nr.remove();
                delete this.map[nr.key];
                this.destroy(nr.key, nr.value);
            }
        }
        var n = <LRUNode<E>>this.list.addFirst(value);
        n.key = key;
        this.map[key] = n;
    }

    public get(key: string): E{
        var n = this.map[key];
        if (n){
            n.remove();
            this.list.addFirstNode(n);
            return n.value;
        }
        return null;
    }

    public destroy(key: string, value: E){

    }

}

export function lru<E>(){
    return new LRU<E>();
}

export default lru;