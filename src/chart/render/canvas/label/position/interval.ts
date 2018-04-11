/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator} from "../../../../../collection/iterator/index";
import {IPositionedLabel} from "./index";
import {LabelType} from "../cache/index";

export class SequenceLabelIterator implements IIterator<IPositionedLabel>{

    constructor(public iterator: IIterator<number>, public formatter: (n: number) => LabelType ){
    }

    public hasNext(){
        return this.iterator.hasNext();
    }

    public next(){
        var s = this.iterator.next();
        return {
            label: this.formatter(s),
            position: s
        }
    }

}
