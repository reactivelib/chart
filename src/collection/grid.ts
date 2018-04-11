import {default as sorted, SortedArray} from "./array/sorted";

export interface IGridSortKey{
    index: number;
}

export interface IGridElement<E> extends IGridSortKey{
    index: number;
    elements: E[];
}

export interface IGridLine<E>{
    index: number;
    elements: SortedArray<IGridSortKey, IGridElement<E>>;
}

class XGridLine<E> implements IGridLine<E>{

    public elements: SortedArray<IGridSortKey, IGridElement<E>>;

    constructor(public index: number){
        this.elements = sorted<IGridSortKey, IGridElement<E>>({
            compare: (a ,b) => {
                return a.index - b.index;
            }
        })
    }

}

export class YGridLine<E> implements IGridLine<E>{

    public elements: SortedArray<IGridSortKey, IGridElement<E>>;

    constructor(public index: number){
        this.elements = sorted<IGridSortKey, IGridElement<E>>({
            compare: (a ,b) => {
                return a.index - b.index;
            }
        })
    }

}


export class Grid<E>{

    public xyToElement: SortedArray<IGridSortKey, IGridLine<E>>;
    public yxToElement: SortedArray<IGridSortKey, IGridLine<E>>;

    constructor(){
        this.xyToElement = sorted<IGridSortKey, IGridLine<E>>({
            compare: (a, b) => a.index - b.index
        });
        this.yxToElement = sorted<IGridSortKey, IGridLine<E>>({
            compare: (a,b) => a.index - b.index
        });
    }

    public add(x: number, y: number, element: E){
        var gridLine: IGridLine<E>;

        var els = this.xyToElement.findFirst({
            index: x
        });
        if (els < 0){
            gridLine = new YGridLine<E>(x);
            this.xyToElement.insert(gridLine);
        }
        else {
            gridLine = this.xyToElement.array[els];
            if (gridLine.index !== x){
                gridLine = new YGridLine<E>(x);
                this.xyToElement.insert(gridLine);
            }
        }
        var indx = gridLine.elements.findFirst({
            index: y
        });
        if (indx >= 0 && gridLine.elements.array[indx].index === y){
            gridLine.elements.array[indx].elements.push(element);
        }
        else {
            gridLine.elements.insert({
                index: y, elements: [element]
            });
        }

        els = this.yxToElement.findFirst({
            index: y
        });
        if (els < 0){
            gridLine = new XGridLine<E>(y);
            this.yxToElement.insert(gridLine);
        }
        else {
            gridLine = this.yxToElement.array[els];
            if (gridLine.index !== y){
                gridLine = new XGridLine<E>(y);
                this.yxToElement.insert(gridLine);
            }
        }
        indx = gridLine.elements.findFirst({
            index: x
        });
        if (indx >= 0 && gridLine.elements.array[indx].index === x){
            gridLine.elements.array[indx].elements.push(element);
        }
        else {
            gridLine.elements.insert({
                index: x,
                elements: [element]
            });
        }
    }

    public get(x: number, y: number): E[]{
        var indx = this.xyToElement.findFirst({
            index: x
        });
        if (indx < 0){
            return null;
        }

        var els = this.xyToElement.array[indx];
        if (els.index !== x){
            return null;
        }
        indx = els.elements.findFirst({
            index: y
        });
        if (indx < 0){
            return null;
        }
        var el = els.elements.array[indx];
        if (el.index !== y){
            return null;
        }
        return el.elements;
    }

    public remove(x: number, y: number): E[]{
        var indx = this.xyToElement.findFirst({
            index: x
        });
        if (indx < 0){
            return null;
        }
        var els = this.xyToElement.array[indx];
        if (els.index !== x){
            return null;
        }
        indx = els.elements.findFirst({
            index: y
        });
        if (indx < 0){
            return null;
        }
        var el = els.elements.array[indx];
        if (el.index !== y){
            return null;
        }
        var r = els.elements.removeByIndex(indx);
        return r.elements;
    }

}