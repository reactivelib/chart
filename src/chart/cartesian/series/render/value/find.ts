/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ISeriesShape} from "../../../../series/render/base";
import {getTransform} from "../../../../render/canvas/shape/group/index";
import {IXYSeriesSystem} from "../../series";
import {AffineMatrix} from "../../../../../math/transform/matrix";
import {ICartesianPointDataHolder} from "../../../../data/shape/transform/cartesian/point/index";
import {ICartesianXPoint} from "../../../../../datatypes/value";
import {getEndX} from "../../../../../datatypes/range";
import {ICanvasChildShape} from "../../../../render/canvas/shape/index";

export class PointSeriesShape implements ISeriesShape{

    public parent: ICanvasChildShape;

    constructor(public data: ICartesianPointDataHolder, public series: IXYSeriesSystem){

    }
    
    public transform: AffineMatrix;
    
    public getRadius(r: ICartesianXPoint){
        return 4;
    }

    public getScreenBoundingBox(){
        var n = this.data;
        var dx = (n.x + getEndX(n)) / 2;
        var transform = this.transform || getTransform(this);
        var pt = transform.transform(dx, n.y);
        var x = (pt.x);
        var y = (pt.y);
        var r = this.getRadius(n);
        return {
            x: x - r,
            y: y - r,
            width: r * 2,
            height: r * 2
        };
    }
}
