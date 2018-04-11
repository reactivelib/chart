/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {createShapesDataCollection} from "../data";
import {IOptional} from "@reactivelib/core";
import {IXYAxis} from "../../../../cartesian/axis/index";
import {StackedShapesDataManager, StackingShapesDataCollectionUpdater} from "../transformer/x/stacking";
import {ICartesianXPoint} from "../../../../../datatypes/value";
import {IDataTransformer} from "../transformer/x/update";
import {variable} from "@reactivelib/reactive";

export function createPointShapesDataCollection(xAxis: variable.IVariable<IXYAxis>, stack: IOptional<StackedShapesDataManager<ICartesianXPoint>>,
                                                pointTransformer: IDataTransformer, data: variable.IVariable<any>){
    
    if (stack.present){
            var updater = new StackingShapesDataCollectionUpdater(data.value, pointTransformer, () => xAxis.value.window);
            var st = stack.value;
            st.add(updater);
            return {
                cancel: () => {
                    st.remove(updater);
                    updater.cancel();
                },
                data: updater.shapeData
            }
    }
    else
    {
        return createShapesDataCollection(pointTransformer, () => xAxis.value.window, data);
    }
}