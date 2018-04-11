/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CartesianSeriesGroupRenderer} from "../group";
import {CanvasContext} from "../../../../render/canvas/context/index";
import {IStylable} from "../../../../render/canvas/style/index";
import {roundFillOrStroke} from "../../../../render/canvas/shape/round/strokeFill"
import {drawByStyle} from "../../../../render/canvas/style/apply";
import {drawIteratorChildren} from "../../../../render/canvas/shape/group/draw/children";
import {getYForStack, SeriesPointShape} from "./shape";
import {ICartesianPointDataHolder} from "../../../../data/shape/transform/cartesian/point";
import {copyClass, IOptional} from "@reactivelib/core";
import {create, inject} from "../../../../../config/di";
import {ICanvasChildShape} from "../../../../render/canvas/shape";
import {ISeriesShape} from "../../../../series/render/base";
import {ICartesianSeriesShapeSettings} from "../../series";

export interface IPointShapeSettings extends ICartesianSeriesShapeSettings{

    type: "point";
    radius?: number;
    form?: "rectangle" | "circle"

}

export class PointShapeRenderer extends CartesianSeriesGroupRenderer{

    @inject
    stack: IOptional<any>

    settings: IPointShapeSettings

    @create
    shapeFactory: (parent: PointShapeRenderer, sd: ICartesianPointDataHolder) => SeriesPointShape;

    create_shapeFactory(){
        var ShapeConstructor = copyClass(SeriesPointShape);
        if (this.series.colorScale.present){
            ShapeConstructor.prototype.colorScale = this.series.colorScale.value;
        }
        if (this.series.radiusScale.present){
            ShapeConstructor.prototype.radiusScale = this.series.radiusScale.value;
        }
        if ("radius" in this.settings){
            ShapeConstructor.prototype.radius = this.settings.radius;
        }
        if (this.stack.present){
            ShapeConstructor.prototype.getY = getYForStack;
        }
        return (parent: PointShapeRenderer, sd: ICartesianPointDataHolder) => new ShapeConstructor(sd, parent);
    }

    create(parent: PointShapeRenderer, sd: ICartesianPointDataHolder): ISeriesShape & ICanvasChildShape {
        return this.shapeFactory(parent, sd);
    }

    provideStyle(){
        var s = this.color.toString();
        return {
            fillStyle: s
        }
    }

    public draw(ctx: CanvasContext){
        drawByStyle(<IStylable><any>this, ctx, () => {
            this.round = roundFillOrStroke(ctx);
            drawIteratorChildren(this.shapes.iterator(), ctx);
        });
    }

}