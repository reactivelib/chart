/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {
    CategoricalShape,
    IDiscreteShapeSettings,
    NormalCartesianCategorySeriesGroupRenderer,
    SquareCartesianCategorySeriesGroupRenderer,
    SquareCategoricalShape,
} from "./shape";
import {ICartesianPointDataHolder} from "../../../../data/shape/transform/cartesian/point/index";
import {CartesianSeriesGroupRenderer} from "../group";
import {Constructor, copyClass} from "@reactivelib/core";
import {BaseCartesianRenderer} from "../base";

export class CategoryCartesianSeriesRenderer extends BaseCartesianRenderer{

    createRenderer(settings: IDiscreteShapeSettings){
        var ShapeConstructor = copyClass(CategoricalShape);
        var rend: Constructor<CartesianSeriesGroupRenderer> = NormalCartesianCategorySeriesGroupRenderer;
        if (settings.square){
            ShapeConstructor = copyClass(SquareCategoricalShape);
            rend = SquareCartesianCategorySeriesGroupRenderer;
        }
        if (this.series.colorScale.present){
            ShapeConstructor.prototype.colorScale = this.series.colorScale.value;
        }
        if (settings.roundedCorner){
            //  base.push(makeRoundedCornerRectangle);
        }
        var psr = new rend(this.series, (parent: NormalCartesianCategorySeriesGroupRenderer, sd: ICartesianPointDataHolder) => new ShapeConstructor(sd, parent));
        return psr;
    }

}