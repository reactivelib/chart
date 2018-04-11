/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ISeriesShape, SeriesRenderer} from "../../../../../series/render/base";
import {ICanvasChildShape} from "../../../../../render/canvas/shape/index";
import {CanvasContext} from "../../../../../render/canvas/context/index";
import {getTransform} from "../../../../../render/canvas/shape/group/index";
import {getEndX} from "../../../../../../datatypes/range";
import {IIntervalData} from "../../../../../../datatypes/interval";
import {IXIndexedShapeDataHolder} from "../../../../../data/shape/cartesian/transformer/x/index";
import {IColor} from "../../../../../../color/index";
import {applyStyle, applyStyleToContext, ICanvasStyle, unapplyStyle} from "../../../../../render/canvas/style/index";
import {ICancellable} from "@reactivelib/reactive";
import {Highlighter, IHighlightable} from "../../../../../render/style/highlight";
import {highlight} from "../../../../../render/style/highlight/area/shape/color";
import {CartesianSeries} from "../../../series";

class AreaSeriesShape implements ISeriesShape{

    public parent: ICanvasChildShape;

    constructor(public data: IIntervalData, public series: CartesianSeries){

    }

    getScreenBoundingBox(){
        var n = this.data;
        var transform = getTransform(this);
        var x = (n.x + getEndX(n)) / 2;
        var bl = transform.transform(x, n.y);
        var tr = transform.transform(x, n.ye);
        var sy = bl.y;
        var by = tr.y;
        if (sy > by){
            var s = sy;
            sy = by;
            by = s;
        }
        var x = (bl.x);
        var y = (sy);
        var width = (tr.x) - x;
        var height = (by) - y;
        return {
            x: x, y: y, width: width, height: height
        };
    }
}

export class AreaIntervalShapeRenderer extends SeriesRenderer implements ICanvasChildShape, IHighlightable{

    public style: ICanvasStyle;
    public parent: ICanvasChildShape;
    public color: IColor;
    public highlighter: Highlighter;
    series: CartesianSeries;

    public findShapesByIndex(indx: number){
        var sd = this.series.shapeData.get(indx);
        return [new AreaSeriesShape(<IIntervalData & IXIndexedShapeDataHolder<any>>sd, this.series)];
    }

    constructor(settings) {
        super(settings);
    }
    
    public getPosX(p: IXIndexedShapeDataHolder<any>){
        return (p.x + getEndX(p))/ 2;
    }

    public draw(ctx: CanvasContext){
        var last = applyStyle(this.style, ctx);
        var endPoints = [];
        var first: IIntervalData & IXIndexedShapeDataHolder<any>;
        var it = this.series.shapeData.iterator();
        if (it.hasNext()){
            first = <IIntervalData & IXIndexedShapeDataHolder<any>>it.next();
            var pt = ctx.transform.transform(this.getPosX(first), first.y);
            ctx.context.moveTo(pt.x, pt.y);
            endPoints.push({
                x: this.getPosX(first),
                y: first.ye
            });
        }
        else {
            return;
        }
        while(it.hasNext()){
            var d = <IIntervalData & IXIndexedShapeDataHolder<any>>it.next();
            var x = this.getPosX(d);
            pt = ctx.transform.transform(x, d.y);
            ctx.context.lineTo(pt.x, pt.y);
            endPoints.push({
                x: x,
                y: d.ye
            });
        }
        for (var i=endPoints.length - 1; i >= 0; i--){
            var ep = endPoints[i];
            pt = ctx.transform.transform(this.getPosX(ep), ep.y);
            ctx.context.lineTo(pt.x, pt.y);
        }
        pt = ctx.transform.transform(this.getPosX(first), first.y);
        ctx.context.lineTo(pt.x, pt.y);
        applyStyleToContext(ctx, null);
        ctx.context.beginPath();
        unapplyStyle(last, ctx);
    }

    public cancel(){
        
    }

    highlight(): ICancellable{
        return highlight(this);
    }
    

}
