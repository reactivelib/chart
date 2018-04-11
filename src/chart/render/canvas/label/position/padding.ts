/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPadding} from "../../../../../geometry/rectangle/index";
import {IIterator, iterator} from "../../../../../collection/iterator/index";
import {IPositionedRectangle} from "../../../../../geometry/layout/rectangle/position/index";

export class PaddedPositionedLabel implements IPositionedRectangle{

    constructor(public label: IPositionedRectangle, public padding: IPadding){
        
    }

    get x(){
        return this.label.x - this.padding.left;
    }

    set x(x: number){
        this.label.x = x + this.padding.left;
    }

    get y(){
        return this.label.y - this.padding.top;
    }

    set y(y: number){
        this.label.y = y + this.padding.top;
    }

    get width(){
        return this.label.width + this.padding.left + this.padding.right;
    }

    get height(){
        return this.label.height + this.padding.top + this.padding.bottom;
    }

    get position(){
        return this.label.position;
    }

    set position(p: number){
        this.label.position = p;
    }

}

export function labelToPadded(label: IPositionedRectangle, padding: IPadding): PaddedPositionedLabel{
    return new PaddedPositionedLabel(label, padding);
}

export function labelsToPadded(labels: IIterator<IPositionedRectangle>, padding: IPadding): IIterator<PaddedPositionedLabel>{
    return iterator(labels).map(l => new PaddedPositionedLabel(l, padding));
}
