/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {
    AxisTypes,
    CategoricalLabelSetting,
    ICategory,
    IDiscreteAxisSettings,
    IDiscreteXYAxis,
    XYAxisSystem
} from "../index";
import {IXSortedSeries} from "../../series/x/index";
import {IAxisTimeUnit} from "../time/unit/index";
import {variable} from "@reactivelib/reactive";
import {ITableResults} from "../../data/parse";
import {IReactiveXSortedRingBuffer, ReactiveXSortedRingBuffer} from "../../../reactive/collection/ring";
import {
    DefaultCategoryCollection,
    ICategoryCollection,
    ManualCategoryCollection,
    SeriesCategoryCollection
} from "./collection";
import {CartesianSeries} from "../../series/series";
import {deps, variableFactory} from "../../../../config/di";

function parseCategories(cats: CategoricalLabelSetting[] | IReactiveXSortedRingBuffer<ICategory>): IReactiveXSortedRingBuffer<ICategory>{
    if (Array.isArray(cats)){
        var buffer = new ReactiveXSortedRingBuffer<ICategory>();
        cats.forEach((c, indx) => {
            if (typeof c === "object"){
                if (!("x" in c)){
                    (<any>c).x = indx;
                }
                buffer.push(c);
            }
            else{
                buffer.push({
                    x: indx,
                    id: c
                });
            }
        });
        return buffer;
    }
    return cats;
}

function getCategoryByTime(index: number, ser: IXSortedSeries){
    if (!ser){
        return null;
    }
    var d = <any>ser.data.findOne(index);
    if (!d){
        return null;
    }
    if (!d.time){
        return null;
    }
    return {
        index: index,
        id: d.time
    };
}

function getIndexCategory(this: IDiscreteXYAxis, index: number){
    return {
        x: index,
        id: index+""
    }
}


export default function cat(axisSettings: IDiscreteAxisSettings, axesSettings: IDiscreteAxisSettings, axis: XYAxisSystem, 
    type: variable.IVariable<AxisTypes>, time: IAxisTimeUnit, categorySeries: variable.IVariable<CartesianSeries>, chartData: variable.IVariable<ITableResults>): any{
    var res = variable<ICategoryCollection>(null).listener(v => {
        if (type.value === "discrete"){            
            if (axisSettings.categories || axesSettings.categories) {
                var catColl = new ManualCategoryCollection(parseCategories(axisSettings.categories || axesSettings.categories));
                v.value = catColl;
                return;
            }
            else if (categorySeries.value){
                var serColl = new SeriesCategoryCollection(categorySeries.value);
                v.value = serColl;
                return;
            }
            else if (chartData.value && chartData.value.categories){
                var catColl = new ManualCategoryCollection(parseCategories(chartData.value.categories));
                v.value = catColl;
                return;
            }
            else {                            
                v.value = new DefaultCategoryCollection();
                return;
            }
        }
        else{
            v.value = new DefaultCategoryCollection();
            return;
        }
    });
    (<XYAxisSystem> <any>axis).cancels.push(res.$r);
    return res;
}