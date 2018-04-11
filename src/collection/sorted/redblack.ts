import {ISortedCollection, KeyValue} from "./index";
import {IIterator} from "../iterator/index";

export class RedBlackNode<K, E>{

    key: K;
    value: E;
    red: boolean;
    left: RedBlackNode<K, E>;
    right: RedBlackNode<K, E>;
    parent: RedBlackNode<K, E>;

}

export var nil = new RedBlackNode<any, any>();
nil.right = nil;
nil.left = nil;
nil.parent = nil;
nil.red = false;

export class RedBlackTreeIterator<K, E> implements IIterator<KeyValue<K, E>>{

    private stack: RedBlackNode<K, E>[] = [];
    private node: RedBlackNode<K, E>;
    private nextVal: RedBlackNode<K, E> = null;

    constructor(private tree: RedBlackTree<K, E>, start: K, startInclude: boolean, public end: K, public endInclude: boolean){
        this.node = tree.root;
        if (start != null){
            var first = this.tree.findBiggerNode(start, startInclude);
            while(first !== nil){
                if (startInclude){
                    if (this.tree.compare(start, first.key) <= 0){
                        this.stack.push(first);
                    }
                }
                else {
                    if (this.tree.compare(start, first.key) < 0){
                        this.stack.push(first);
                    }
                }
                first = first.parent;
            }
            this.stack = this.stack.reverse();
            this.node = nil;
        }
        else {
            while(this.node !== nil){
                this.stack.push(this.node);
                this.node = this.node.left;
            }
        }
    }

    public hasNext(){
        this.getNextVal();
        return this.nextVal !== null;
    }

    public next(){
        this.getNextVal();
        var nv = this.nextVal;
        this.nextVal = null;
        return {
            key: nv.key,
            value: nv.value
        };
    }

    public nextNode(): RedBlackNode<K, E>{
        this.getNextVal();
        var nv = this.nextVal;
        this.nextVal = null;
        return nv;
    }

    private getNextVal(){
        if (this.nextVal === null){
            while(this.node !== nil){
                this.stack.push(this.node);
                this.node = this.node.left;
            }
            if (this.stack.length === 0){
                return;
            }
            this.node = this.stack.pop();
            if (this.end != null){
                if (this.endInclude){
                    if (this.tree.compare(this.end, this.node.key) < 0){
                        this.stack = [];
                        this.node = nil;
                        return;
                    }
                }
                else {
                    if (this.tree.compare(this.end, this.node.key) <= 0){
                        this.stack = [];
                        this.node = nil;
                        return;
                    }
                }
            }
            var n = this.node;
            this.nextVal = n;
            this.node = this.node.right;
        }
    }

}

export class RedBlackTree<K, E> implements ISortedCollection<K, E>{

    public root: RedBlackNode<K, E> = nil;
    public length: number = 0;

    constructor(public compare: (a:K, b: K) => number){

    }

    public iterator(start: K = null, startInclude: boolean = true, end: K = null, endInclude: boolean = true){
        if (start !== null && end !== null && this.compare(start, end) === 0){
            if (!startInclude || !endInclude){
                startInclude = false;
                endInclude = false;
            }
        }
        return new RedBlackTreeIterator<K, E>(this, start, startInclude, end, endInclude);
    }

    public clear(){
        var tree = new RedBlackTree<K, E>(this.compare);
        tree.root = this.root;
        tree.length = this.length;
        this.root = nil;
        this.length = 0;
        return tree;
    }

    public smallest(){
        var last = this.smallestNode();
        if (last){
            return {
                key: last.key,
                value: last.value
            };
        }
        return last;
    }

    protected smallestNode(){
        var node = this.root;
        var last = null;
        while(node !== nil){
            last = node;
            node = node.left;
        }
        return last;
    }

    public biggest(){
        var last = this.biggestNode();
        if (last){
            return {
                key: last.key,
                value: last.value
            };
        }
        return null;
    }

    protected biggestNode(){
        var node = this.root;
        var last = null;
        while(node !== nil){
            last = node;
            node = node.right;
        }
        return last;
    }

    private leftRotate(node: RedBlackNode<K, E>){
        var y = node.right;
        node.right = y.left;
        if (y.left !== nil){
            y.left.parent = node;
        }
        y.parent = node.parent;
        if (node.parent === nil){
            this.root = y;
        }
        else if (node === node.parent.left){
            node.parent.left = y;
        }
        else {
            node.parent.right = y;
        }
        y.left = node;
        node.parent = y;
    }

    private rightRotate(node: RedBlackNode<K, E>){
        var y = node.left;
        node.left = y.right;
        if (y.right !== nil){
            y.right.parent = node;
        }
        y.parent = node.parent;
        if (node.parent === nil){
            this.root = y;
        }
        else if (node === node.parent.right){
            node.parent.right = y;
        }
        else{
            node.parent.left = y;
        }
        y.right = node;
        node.parent = y;
    }

    public insert(key: K, element: E, replace = false){
        var z = new RedBlackNode<K, E>();
        z.value = element;
        z.key = key;
        var y: RedBlackNode<K, E> = nil;
        var x = this.root;
        while(x !== nil){
            y = x;
            var cmp = this.compare(z.key, x.key);
            if (cmp < 0){
                x = x.left;
            }
            else if (cmp > 0) {
                x = x.right;
            }
            else {
                if (replace){
                    var old = x.value;
                    x.value = element;
                    return old;
                }
                else
                {
                    x = this.handleReinsertion(key, element, x, z);
                    if (!x){
                        return null;
                    }
                }
            }
        }
        z.parent = y;
        if (y === nil){
            this.root = z;
        }
        else if (this.compare(z.key, y.key) < 0){
            y.left = z;
        }
        else
        {
            y.right = z;
        }
        z.left = nil;
        z.right = nil;
        z.red = true;
        this.fixInsert(z);
        this.length++;
        return null;
    }

    protected handleReinsertion(key: K, element: E, node: RedBlackNode<K, E>, toInsert: RedBlackNode<K, E>): RedBlackNode<K, E>{
        throw new Error("Key "+key+" already inserted");
    }

    public find(k: K){
        return this.findNode(k).value;
    }

    private fixInsert(z: RedBlackNode<K, E>){
        while(z.parent.red){
            if (z.parent === z.parent.parent.left){
                var y = z.parent.parent.right;
                if (y.red){
                    z.parent.red = false;
                    y.red = false;
                    z.parent.parent.red = true;
                    z = z.parent.parent;
                }
                else{
                    if (z == z.parent.right){
                        z = z.parent;
                        this.leftRotate(z);
                    }
                    z.parent.red = false;
                    z.parent.parent.red = true;
                    this.rightRotate(z.parent.parent);
                }
            }
            else {
                var y = z.parent.parent.left;
                if (y.red){
                    z.parent.red = false;
                    y.red = false;
                    z.parent.parent.red = true;
                    z = z.parent.parent;
                }
                else {
                    if (z == z.parent.left){
                        z = z.parent;
                        this.rightRotate(z);
                    }
                    z.parent.red = false;
                    z.parent.parent.red = true;
                    this.leftRotate(z.parent.parent);
                }
            }
        }
        this.root.red = false;
    }

    private successor(node: RedBlackNode<K, E>): RedBlackNode<K, E>{
        if (node.right !== nil){
            node = node.right;
            while(node.left !== nil){
                node = node.left;
            }
            return node;
        }
        for(var p = node.parent; node === p.right; p = p.parent){
            node = p;
        }
        if (p === this.root){
            p = nil;
        }
        return p;
    }

    public remove(el: K){
        var z = this.findNode(el);
        var val = z.value;
        if (z === nil){
            return null;
        }
        if (z.left === nil || z.right === nil){
            var y = z;
        }
        else
        {
            y = this.successor(z);
        }
        if (y.left !== nil){
            var x = y.left;
        }
        else {
            x = y.right;
        }
        x.parent = y.parent;
        if (y.parent === nil){
            this.root = x;
        }
        else if (y == y.parent.left){
            y.parent.left = x;
        }
        else {
            y.parent.right = x;
        }
        if (y !== z){
            z.key = y.key;
            z.value = y.value;
        }
        if (!y.red){
            this.fixRemove(x);
        }
        this.length--;
        return val;
    }

    private fixRemove(x: RedBlackNode<K, E>){
        while(x !==  this.root && !x.red){
            if (x.parent.left === x){
                var w = x.parent.right;
                if (w.red){
                    w.red = false;
                    x.parent.red = true;
                    this.leftRotate(x.parent);
                    w = x.parent.right;
                }
                if (!w.left.red && !w.right.red){
                    w.red = true;
                    x = x.parent;
                }
                else{
                    if (!w.right.red){
                        w.left.red = false;
                        w.red = true;
                        this.rightRotate(w);
                        w = x.parent.right;
                    }
                    w.red = x.parent.red;
                    x.parent.red = false;
                    w.right.red = false;
                    this.leftRotate(x.parent);
                    x = this.root;
                }
            }
            else {
                var w = x.parent.left;
                if (w.red){
                    w.red = false;
                    x.parent.red = true;
                    this.rightRotate(x.parent);
                    w = x.parent.left;
                }
                if (!w.right.red && !w.left.red){
                    w.red = true;
                    x = x.parent;
                }
                else{
                    if (!w.left.red){
                        w.right.red = false;
                        w.red = true;
                        this.leftRotate(w);
                        w = x.parent.left;
                    }
                    w.red = x.parent.red;
                    x.parent.red = false;
                    w.left.red = false;
                    this.rightRotate(x.parent);
                    x = this.root;
                }
            }
        }
        x.red = false;
    }

    protected findNode(el: K): RedBlackNode<K, E>{
        var n = this.root;
        while(n !== nil){
            var comp = this.compare(el, n.key);
            if (comp > 0){
                n = n.right;
            }
            else if (comp < 0){
                n = n.left;
            }
            else
            {
                return n;
            }
        }
        return nil;
    }

    public findSmallerNode(key: K, includeEqual = false): RedBlackNode<K, E>{
        var n = this.root;
        var last: RedBlackNode<K, E> = nil;
        while(n !== nil){
            var comp = this.compare(key, n.key);
            if (comp < 0){
                n = n.left;
            }
            else if (comp > 0){
                last = n;
                n = n.right;
            }
            else {
                if (includeEqual){
                    last = n;
                }
                break;
            }
        }
        return last;
    }

    public findBiggerNode(key: K, includeEqual = false): RedBlackNode<K, E>{
        var n = this.root;
        var last: RedBlackNode<K, E> = nil;
        while(n !== nil){
            var comp = this.compare(key, n.key);
            if (comp < 0){
                last = n;
                n = n.left;
            }
            else if (comp > 0){
                n = n.right;
            }
            else {
                if (includeEqual){
                    last = n;
                    break;
                }
                n = n.right;
            }
        }
        return last;
    }

    public firstBigger(key:K, include?: boolean){
        var n = this.findBiggerNode(key, include);
        if (n === nil){
            return null;
        }
        return n;
    }

    public firstSmaller(key:K, include?: boolean){
        var n = this.findSmallerNode(key, include);
        if (n === nil){
            return null;
        }
        return n;
    }

    public contains(el: K){
        return this.findNode(el) !== nil;
    }


}