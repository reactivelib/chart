/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator} from "../../../../collection/iterator/index";
import {ICartesianLabelRendererContext} from "../../label/component";
import {ICategory, IDiscreteXYAxis} from "../../axis/index";
import {IPositionedLabel} from "../../../render/canvas/label/position/index";
import {LabelType} from "../../../render/canvas/label/cache/index";
import { variable } from "@reactivelib/reactive";

export class CategoricalLabelIterator implements IIterator<IPositionedLabel>{
    
    public render(ctx: ICartesianLabelRendererContext){
        
    }
    
    constructor(public iterator: IIterator<number>, private axis: IDiscreteXYAxis, public renderLabel: (category: ICategory) => LabelType){

    }


    public hasNext(){
        return this.iterator.hasNext();
    }

    public next(){
        var s = this.iterator.next();
        var l = this.axis.categories.getByIndex(s);
        if (!l){
            return null;
        }
        return {
            label: this.renderLabel(l),
            position: s
        }
    }

}

export function createCategoricalLabelsIterable(axisVar: variable.IVariable<IDiscreteXYAxis>, renderLabel: (l: ICategory) => LabelType){
    return {
        iterator: () => {
            var axis = axisVar.value;
            return new CategoricalLabelIterator(axis.ticks.iterator(axis.window.start,
                axis.window.end), axis, renderLabel);
        }
    }
}