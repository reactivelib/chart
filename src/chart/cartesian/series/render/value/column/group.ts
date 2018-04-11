/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {CanvasContext} from "../../../../../render/canvas/context/index";
import {IStylable} from "../../../../../render/canvas/style/index";
import {roundFillOrStroke} from "../../../../../render/canvas/shape/round/strokeFill";
import {variable} from "@reactivelib/reactive";
import {drawIteratorChildren} from "../../../../../render/canvas/shape/group/draw/children";
import {drawByStyle} from "../../../../../render/canvas/style/apply";
import {CartesianSeriesGroupRenderer} from "../../group";
import {ICanvasChildShape} from "../../../../../render/canvas/shape";
import {ISeriesShape} from "../../../../../series/render/base";
import {ColumnSeriesShape, generateRectangleForStack} from "./shape";
import {ICartesianPointDataHolder} from "../../../../../data/shape/transform/cartesian/point";
import {IOptional} from "@reactivelib/core";
import {IColorScale} from "../../../../../render/canvas/scale/color";
import {create, inject} from "../../../../../../config/di";
import {ICartesianSeriesShapeSettings} from "../../../series";

/**
 * @editor
 */
export interface IColumnShapeSettings extends ICartesianSeriesShapeSettings{

    type: "column";
    start?: number;

}

export class ColumnShapeRenderer extends CartesianSeriesGroupRenderer{

    @inject
    stack: IOptional<any>
    @inject
    colorScale: IOptional<IColorScale>

    settings: IColumnShapeSettings

    @create
    shapeFactory: (parent: ColumnShapeRenderer, sd: ICartesianPointDataHolder) => ColumnSeriesShape;
    create_shapeFactory(){
        class Construct extends ColumnSeriesShape{

        };
        if (this.stack.present){
            Construct.prototype.generateRawRectangle = generateRectangleForStack;
        }
        if (this.colorScale.present){
            Construct.prototype.colorScale = this.colorScale.value;
        }
        return  (parent: ColumnShapeRenderer, sd: ICartesianPointDataHolder) => new Construct(sd, parent)
    }

    create(parent: ColumnShapeRenderer, sd: ICartesianPointDataHolder): ISeriesShape & ICanvasChildShape {
        return this.shapeFactory(parent, sd);
    }

    @create
    public r_start: variable.IVariable<number>;
    get start(){
        return this.r_start.value;
    }
    set start(v){
        this.r_start.value = v;
    }


    create_r_start(){
        var vari = variable<number>(0).listener(v => {
            if ("start" in this.settings){
                v.value = this.settings.start;
            }
            else if (this.series.yAxis.type === "log"){
                v.value = 0.000000001;
            }
        });
        return vari;
    }

    public draw(ctx: CanvasContext){
        drawByStyle(<IStylable><any>this, ctx, () => {
            this.round = roundFillOrStroke(ctx);
            drawIteratorChildren(this.shapes.iterator(), ctx);
        });
    }
}