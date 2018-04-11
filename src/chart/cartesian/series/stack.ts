/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {StackedShapesDataManager} from "../../data/shape/cartesian/transformer/x/stacking";
import { IXSortedSeriesSettings } from "./x/factory";
import { optional } from "@reactivelib/reactive";
import { procedure } from "@reactivelib/reactive";
import { CartesianSeries } from "./series";
import {deps} from "../../../config/di";

export class SeriesStackManager{
    
    public idToStack: {[s: string]: StackedShapesDataManager<any>} = {};
    
    public getStack(id: string){
        var stack: StackedShapesDataManager<any> = this.idToStack[id];
        if (!stack){
            stack = new StackedShapesDataManager<any>();
            this.idToStack[id] = stack; 
        }
        return stack;
    }
    
}