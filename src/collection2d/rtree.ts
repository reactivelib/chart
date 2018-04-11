/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointRectangle} from "../geometry/rectangle";
import {IIterator} from "../collection/iterator/index";
import arrayIt from "../collection/iterator/array";
import {isOverlappingWith} from "../geometry/rectangle/pointRect";

export interface IRectangleNode extends IPointRectangle {

    getChildren(): IIterator<IPointRectangle>;
    isNode: boolean;

}

export abstract class Element implements IRectangleNode{

    public parent: Element = null;
    public children: IPointRectangle[] = [];
    public xs: number = 0;
    public ys = 0;
    public xe = 0;
    public ye = 0;
    public isNode: boolean;
    public _level: number;


    constructor(public tree: RTree){
        
    }

    public getChildren(): IIterator<IPointRectangle>{
        return arrayIt(this.children);
    }

    public abstract create(tree: RTree): Element;

    public insert(rect: IPointRectangle){
        this.children.push(rect);
        if (this.children.length === 1){
            this.xs = rect.xs;
            this.ys = rect.ys;
            this.xe = rect.xe;
            this.ye = rect.ye;
        }
        else{
            spanning(this, rect);
        }
    }

    public remove(index: number){
        var toRem = this.children[this.children.length - 1];
        var r = this.children[index];
        this.children[index] = toRem;
        this.children.length--;
        return r;
    }

    public _recalculateBB(){
        if (this.children.length === 1)
        {
            var sp = this.children[0];
            this.xs = sp.xs;
            this.ys = sp.ys;
            this.xe = sp.xe;
            this.ye = sp.ye;
        }
        else
        {
            var c = this.children[0];
            this.xs = c.xs;
            this.ys = c.ys;
            this.xe = c.xe;
            this.ye = c.ye;
            for (var i=1; i < this.children.length; i++)
            {
                spanning(this, this.children[i]);
            }
        }
    }

    public split(){
        var xLowerDistr = this._splitDistributions(this.children.slice().sort(function(a, b){
            return a.xs - b.xs;
        }));
        var xUpperDistr = this._splitDistributions(this.children.slice().sort(function(a, b){
            return (a.xe) - (b.xe);
        }));
        var yLowerDistr = this._splitDistributions(this.children.slice().sort(function(a, b){
            return a.ys - b.ys;
        }));
        var yUpperDistr = this._splitDistributions(this.children.slice().sort(function(a, b){
            return (a.ye) - (b.ye);
        }));
        var distrs = [xLowerDistr, xUpperDistr, yLowerDistr, yUpperDistr];
        var self = this;
        var marginSums = distrs.map(function(d){
            return self._marginSum(d);
        });
        var distributions = distrs[0];
        var min = marginSums[0];
        for (var i=1; i < marginSums.length; i++)
        {
            var s = marginSums[i];
            if (s < min){
                distributions = distrs[i];
                min = s;
            }
        }
        var minOverlaps = [];
        var minOverlap = Number.MAX_VALUE;
        for (var i=0; i < distributions.length; i++)
        {
            var d = distributions[i];
            var ov = overlapArea(d.bb1, d.bb2);
            if (ov < minOverlap)
            {
                minOverlaps = [];
                minOverlaps.push(d);
                minOverlap = ov;
            }
            else if (ov === minOverlap)
            {
                minOverlaps.push(d);
            }
        }
        var best;
        if (minOverlaps.length === 1)
        {
            best = minOverlaps[0];
        }
        else
        {
            best = minOverlaps[0];
            var minArea = (best.bb1.xe - best.bb1.xs) * (best.bb1.ye - best.bb1.ys) + (best.bb2.xe - best.bb2.xs) * (best.bb2.ye - best.bb2.ys);
            for (var i=1; i < minOverlaps.length; i++)
            {
                var b = minOverlaps[i];
                var a = (b.bb1.xe - b.bb1.xs )* (b.bb1.ye - b.bb1.ys) + (b.bb2.xe - b.bb2.xs) * (b.bb2.ye - b.bb2.ys);
                if (a < minArea)
                {
                    minArea = a;
                    best = b;
                }
            }
        }
        var k = best.k;
        var fNr = this.tree.m - 1 + k;
        var childs = best.children;
        this.children = [];
        var leaf2 = this.create(this.tree);
        for (var i=0; i < fNr; i++)
        {
            this.insert(childs[i]);
        }
        for (;i < childs.length; i++)
        {
            leaf2.insert(childs[i]);
        }
        return leaf2;
    }

    private _marginSum(distr: {
        k: number,
        bb1: IPointRectangle,
        bb2: IPointRectangle,
        children: IPointRectangle[]
    }[]){
        var s = 0;
        for (var i=0; i < distr.length; i++)
        {
            var d = distr[i];
            s += (d.bb1.xe - d.bb1.xs) + (d.bb1.ye - d.bb1.ys) + (d.bb2.xe - d.bb2.xs) + (d.bb2.ye - d.bb2.ys);
        }
        return s;
    }

    private _splitDistributions(children: IPointRectangle[]){
        var nr = this.tree.M - 2 * this.tree.m + 2;
        var dists = [];
        for (var k=1; k <= nr; k++)
        {
            var fNr = this.tree.m - 1 + k;
            var c = children[0];
            var spanning1 = {
                xs: c.xs,
                ys: c.ys,
                xe: c.xe,
                ye: c.ye
            }
            for (var i=1; i < fNr; i++){
                spanning(spanning1, children[i]);
            }
            c = children[i];
            var spanning2 = {
                xs: c.xs,
                ys: c.ys,
                xe: c.xe,
                ye: c.ye
            }
            for (var i=i+1; i < children.length; i++)
            {
                spanning(spanning2, children[i]);
            }
            dists.push({
                k: k,
                bb1: spanning1,
                bb2: spanning2,
                children: children
            });
        }
        return dists;
    }
}

export class Node extends Element{

    constructor(tree: RTree){
        super(tree);
        this.isNode = true;
    }

    public create(tree: RTree){
        return new Node(tree);
    }

    public insert(rect: Element){
        super.insert(rect);
        rect.parent = this;
    }

}

function overlapArea(r1: IPointRectangle ,r2: IPointRectangle){
    var xOverlap = Math.max(0, Math.min(r1.xe, r2.xe) - Math.max(r1.xs, r2.xs));
    var yOverlap = Math.max(0, Math.min(r1.ye, r2.ye) - Math.max(r1.ys, r2.ys));
    return xOverlap * yOverlap;
}

export class Leaf extends Element{
    constructor(rtree: RTree){
        super(rtree);
        this.isNode = false;
    }

    public create(rtree: RTree){
        return new Leaf(rtree);
    }
}

function spanning(rect1: IPointRectangle, rect2: IPointRectangle){
    var xS = rect1.xs;
    var xE = rect1.xe;
    var yS = rect1.ys;
    var yE = rect1.ye;
    var r = rect2;
    var x = r.xs;
    var y = r.ys;
    xS = Math.min(xS, x);
    yS = Math.min(yS, y);
    xE = Math.max(xE, r.xe);
    yE = Math.max(yE, r.ye);
    rect1.xs = xS;
    rect1.ys = yS;
    rect1.xe = xE;
    rect1.ye = yE;
}

function enlargement(toEnlarge: IPointRectangle, enlarger: IPointRectangle){
    var sR = {
        xs: toEnlarge.xs,
        ys: toEnlarge.ys,
        xe: toEnlarge.xe,
        ye: toEnlarge.ye
    }
    spanning(sR, enlarger);
    return (sR.xe - sR.xs) * (sR.ye - sR.ys) - ((toEnlarge.xe - toEnlarge.xs) * (toEnlarge.ye - toEnlarge.ys));
}

export class RTree{

    public m: number = 2;
    public M: number = 10;
    public root: Element = new Leaf(this);
    public size = 0;

    public isEqualRectangle(r1: IPointRectangle, r2: IPointRectangle){
        return r1 === r2;
    }

    constructor(){
    }

    public leaf(){
        return new Leaf(this);
    }

    public node(){
        return new Node(this);
    }

    public add(rect: IPointRectangle){
        this._insert(rect, -1);
        this.size++;
    }

    public _insert(rect: IPointRectangle, level: number){
        var leaf: Leaf;
        if (level < 0)
        {
            leaf = this._chooseLeaf(rect);
        }
        else
        {
            leaf = this._chooseNode(rect, level);
        }
        leaf.insert(rect);
        var newNode = null;
        if (leaf.children.length > this.M){
            newNode = leaf.split();
        }
        var res = this._adjustTree(leaf, newNode);
        if (res.nn != null){
            var n = new Node(this);
            n.insert(res.n);
            n.insert(res.nn);
            this.root = n;
        }
    }

    public iterator(): IIterator<IPointRectangle>{
        return arrayIt(this.findOverlapping(this.root));
    }

    public contains(rect: IPointRectangle){
        return this._findLeaf(rect, this.root, 0) !== null;
    }

    public findChild(rect: IPointRectangle): IPointRectangle{
        var l = this._findLeaf(rect, this.root, 0);
        if (!l){
            return null;
        }
        return l.leaf.children[l.index];
    }

    public remove(rect: IPointRectangle): IPointRectangle{
        var r = this._findLeaf(rect, this.root, 0);
        if (r === null)
        {
            return null;
        }
        var rem = r.leaf.remove(r.index);
        var Q = [];
        var N = r.leaf;
        var level = r.level;
        while(N !== this.root){
            var P = N.parent;
            if (N.children.length < this.m)
            {
                P.remove(P.children.indexOf(N));
                N._level = level;
                Q.push(N);
            }
            else
            {
                N._recalculateBB();
            }
            N = P;
            level--;
        }
        for (var i= Q.length - 1; i>=0; i--){
            var ri = Q[i];
            if (!ri.isNode){
                for (var j=0; j < ri.children.length; j++)
                {
                    this._insert(ri.children[j], -1);
                }
            }
            else
            {
                for (var j=0; j < ri.children.length; j++)
                {
                    var ch = ri.children[j];
                    this._insert(ch, ri._level);
                }

            }
        }
        if (this.root.isNode && this.root.children.length === 1)
        {
            this.root = <Node>this.root.children[0];
            this.root.parent = null;
        }
        this.size--;
        return rem;
    }

    public findOverlapping(rect: IPointRectangle){
        var res: IPointRectangle[] = [];
        this._findOverlapping(rect, this.root, res);
        return res;
    }

    public _findOverlapping(rect: IPointRectangle, node: Element, results: IPointRectangle[]){
        var self = this;
        if (node.isNode){
            node.children.forEach(function(n){
                if (self.isOverlapping(n, rect)){
                    self._findOverlapping(rect, <Element>n, results);
                }
            });
        }
        else
        {
            node.children.forEach(function(n){
                if (self.isOverlapping(n, rect)){
                    results.push(n);
                }
            });
        }
    }

    public isOverlapping(r1: IPointRectangle, r2: IPointRectangle){
        return isOverlappingWith(r1, r2);
    }

    public _findLeaf(rect: IPointRectangle, n: Element, level: number): {index: number, leaf: Leaf, level: number}{
        if (n.isNode)
        {
            for (var i=0; i < n.children.length; i++)
            {
                var ch = n.children[i];
                if (contains(ch, rect))
                {
                    var r = this._findLeaf(rect, <Element>ch, level + 1);
                    if (r != null){
                        return r;
                    }
                }
            }
        }
        else
        {
            for (var i=0; i < n.children.length; i++){
                if (this.isEqualRectangle(rect, n.children[i])){
                    return {
                        index: i,
                        leaf: n,
                        level: level
                    }
                }
            }
        }
        return null;
    }

    public _adjustTree(n: Element, nn: Element){
        var parent = n.parent;
        while (parent !== null)
        {
            parent._recalculateBB();
            if (nn != null)
            {
                parent.insert(nn);
                nn = null;
            }
            if (parent.children.length > this.M){
                nn = parent.split();
            }
            n = parent;
            parent = n.parent;
        }
        return {
            n: n,
            nn: nn
        };
    }

    public _chooseLeaf(rect: IPointRectangle){
        var N = this.root;
        while(N.isNode)
        {
            N = this._chooseSubtree(rect, N);
        }
        return N;
    }

    public _chooseNode(rect: IPointRectangle, level: number){
        var N = this.root;
        while(level > 0)
        {
            N = this._chooseSubtree(rect, N);
            level--;
        }
        return N;
    }

    public _chooseSubtree(rect: IPointRectangle, N: Element): Element{
        var minEnl = Number.MAX_VALUE;
        var mins = [];
        for (var i=0; i < N.children.length; i++){
            var child = N.children[i];
            var enl = enlargement(child, rect);
            if (enl < minEnl)
            {
                mins = [];
                mins.push(i);
                minEnl = enl;
            }
            else if (enl === minEnl)
            {
                mins.push(i);
            }
        }
        if (mins.length === 1){
            return <Element>N.children[mins[0]];
        }
        else
        {
            var minArea = Number.MAX_VALUE;
            var indx = mins[0];
            for (var i=0; i < mins.length; i++)
            {
                var ix = mins[i];
                var ch = N.children[ix];
                var area = (ch.xe - ch.xs) * (ch.ye - ch.ys);
                if (area < minArea)
                {
                    minArea = area;
                    indx = ix;
                }
            }
            return <Element>N.children[indx];
        }
    }
}

function contains(outer: IPointRectangle, inner: IPointRectangle){
    var x0 = outer.xs;
    var y0 = outer.ys;
    var x1 = inner.xs;
    var y1 = inner.ys;
    return (x1 >= x0) && (y1 >= y0) &&  (inner.xe) <= (outer.xe) && (inner.ye) <= (outer.ye);
}


export default function rtree(){
    return new RTree();
}