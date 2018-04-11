/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICanvasChildShape} from "../../../../../render/canvas/shape/index";
import {CanvasContext} from "../../../../../render/canvas/context/index";
import {IXSortedSeriesSystem} from "../../../x/index";
import {PointSeriesShape} from "../find";
import {ICartesianPointDataHolder} from "../../../../../data/shape/transform/cartesian/point/index";
import {getEndX} from "../../../../../../datatypes/range";
import {BruteForceSeriesShapeFinder} from '../../../../../render/canvas/series/find/data/brute';
import {ICartesianXPoint} from "../../../../../../datatypes/value";
import {IPoint} from "../../../../../../geometry/point/index";
import {drawByStyle} from "../../../../../render/canvas/style/apply";
import {SeriesRenderer} from "../../../../../series/render/base";
import {create} from "../../../../../../config/di";
import {ICartesianSeriesShapeSettings} from "../../../series";
import {ICancellable} from "@reactivelib/reactive/src/cancellable";
import {nullCancellable} from "@reactivelib/reactive";
import {LineShapeRenderer} from "../line/shape";


function getX(data: ICartesianPointDataHolder){
    return (data.x + getEndX(data)) / 2;
}

export interface IAreaShapeSettings extends ICartesianSeriesShapeSettings{

    type: "area";
    start?: number;

}

export class AreaShapeRenderer extends SeriesRenderer implements ICanvasChildShape{


    public parent: ICanvasChildShape;
    @create
    public finder: BruteForceSeriesShapeFinder<ICartesianXPoint>;
    series: IXSortedSeriesSystem
    settings: IAreaShapeSettings

    @create
    start: number;

    highlight(): ICancellable {
        return nullCancellable;
    }

    create_start(){
        var settings = this.settings;
        if ("start" in settings){
            return settings.start;
        }
        else if (this.series.yAxis.type === "log"){
            return 0.000000001;
        }
        else {
            return 0;
        }
    }

    constructor(settings: IAreaShapeSettings) {
        super(settings);
    }

    create_finder(){
        return new BruteForceSeriesShapeFinder({
            iterator: () => {
                var it = this.series.shapeData.iterator();
                return {
                    hasNext: () => {
                        return it.hasNext();
                    },
                    next: () => {
                        var sd = it.next();
                        var shape = new PointSeriesShape(<ICartesianPointDataHolder>sd, this.series);
                        shape.parent = this;
                        (<any>shape).index = it.index;
                        return shape;
                    }
                }
            }
        }, (s: PointSeriesShape) => s.getScreenBoundingBox());
    }

    public getPosX(data: ICartesianPointDataHolder){
        return data.x;
    }

    public getPosY(data: ICartesianPointDataHolder){
        return data.y;
    }
    
    public draw(ctx: CanvasContext){
        var domain = this.series.area.yAxis.domain;
        drawByStyle(this, ctx, () => {
            var it = this.series.shapeData.iterator();
            if (it.hasNext()){
                var first = <ICartesianPointDataHolder>it.next();
            }
            else {
                return;
            }
            var c = ctx.context;
            var tr = ctx.transform;
            var p = tr.transform(getX(first), this.getPosY(first));
            c.moveTo(p.x, p.y);
            while(it.hasNext()){
                var n = <ICartesianPointDataHolder>it.next();
                p = tr.transform(getX(n), this.getPosY(n));
                c.lineTo(p.x, p.y);
            }
            if (!n){
                return;
            }
            if (this.start !== null){
                p = tr.transform(getX(n), this.start);
                c.lineTo(p.x, p.y);
                p = tr.transform(getX(first), this.start);
                c.lineTo(p.x, p.y);
            }
            else {
                p = tr.transform(n.x, domain.start);
                c.lineTo(p.x, p.y);
                p = tr.transform(getX(first), domain.start);
                c.lineTo(p.x, p.y);
            }
            p = tr.transform(getX(first), this.getPosY(first));
            c.lineTo(p.x, p.y);
        });        
    }

    public findShapesByIndex(indx: number){
        var sd = this.series.shapeData.get(indx);
        if (!sd){
            return [];
        }
        var pss = new PointSeriesShape(<ICartesianPointDataHolder>sd, this.series);
        pss.parent = this;
        return [pss];
    }

    find(pt: IPoint, ctx: CanvasContext){
        return this.finder.find(pt, ctx);
    }
    
}

export class StackedAreaShapeRenderer extends AreaShapeRenderer{

    public getPosY(data: ICartesianPointDataHolder){
        return data.ye;
    }
}