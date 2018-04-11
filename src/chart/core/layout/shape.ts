/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IComponentConfig} from "../../../component/layout/axis/index";
import {IShapeConfig} from "@reactivelib/html";
import {
    IRelativePosComponentFactory,
    RelativePositionedComponentProxy
} from "../../../component/layout/axis/component/factory";
import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative/index";
import {IRectangleBaseShape} from "../../render/rectangle";

export interface IShapeComponent extends IComponentConfig{
    type: "shape";
    shape: IRectangleBaseShape | IShapeConfig;
}

export class ShapeComponentFactory implements IRelativePosComponentFactory{

    constructor(public componentRenderer: (shape: IRectangleBaseShape | IShapeConfig) => IRectangleBaseShape){

    }

    create(comp: IRelativePositionedGridElement): IRelativePositionedGridElement{
        var rendered = this.componentRenderer((<IShapeComponent>comp.component).shape);
        return new RelativePositionedComponentProxy(comp, rendered);
    }

}