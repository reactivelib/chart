/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianPointDataHolder} from "../../../../../data/shape/transform/cartesian/point/index";
import {ColumnHighlightPoint, ColumnSeriesShape} from "../../value/column/shape";
import {ColumnShapeRenderer} from "../../value/column/group";
import {copyClass} from "@reactivelib/core";
import {createConstantShapeGroupFromArray} from "../../../../../render/canvas/shape/group/index";
import {ICanvasChildShape} from "../../../../../render/canvas/shape/index";
import {IPointRectangle} from "../../../../../../geometry/rectangle/index";
import {create} from "../../../../../../config/di";

class EndPointHighlighter extends ColumnHighlightPoint{

    getY(rect: IPointRectangle){
        return rect.ys;
    }

}

class ColumnIntervalShape extends ColumnSeriesShape{
    generateRawRectangle(){
        var n = this.data;
        return {
            xs: this.getStartX(n),
            ys: n.y,
            xe: this.getEndX(n),
            ye: n.ye
        }
    }

    createHighlighter(): ICanvasChildShape{
        var hl = super.createHighlighter();
        var eph = new EndPointHighlighter(this);
        return createConstantShapeGroupFromArray([hl, eph]);
    }
}

export class IntervalColumnShapeRenderer extends ColumnShapeRenderer{

    @create
    shapeFactory: (parent: ColumnShapeRenderer, sd: ICartesianPointDataHolder) => ColumnIntervalShape;
    create_shapeFactory(){
        var Construct = copyClass(ColumnIntervalShape);
        if (this.series.colorScale.present){
            Construct.prototype.colorScale = this.series.colorScale.value;
        }
        return (parent: ColumnShapeRenderer, sd: ICartesianPointDataHolder) => new Construct(sd, parent);
    }

}