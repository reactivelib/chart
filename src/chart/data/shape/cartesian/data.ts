/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPointInterval} from "../../../../geometry/interval/index";
import {procedure} from "@reactivelib/reactive";
import {IDataTransformer, ShapesDataCollectionUpdater} from "./transformer/x/update";
import {ICartesianSeriesSettings} from "../../../cartesian/series/series";
import {IVariable} from "@reactivelib/reactive/src/variable";

export function createShapesDataCollection(transformer: IDataTransformer, window: () => IPointInterval, data: IVariable<any>) {
    var updater = new ShapesDataCollectionUpdater(data.value, transformer, window);
    var proc = procedure(() => {
        updater.update();
    });
    return {
        cancel: () =>{
            proc.cancel();
        },
        data: updater.shapeData
    }

}