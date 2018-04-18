/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICartesianSeriesShapeSettings, IXYSeriesSystem} from "../../series";
import {applyWithColorScale, CandlestickSeriesShape, drawStroke, unapplyWithColorScale} from "./candle";
import {ICandlestick} from "../../../../../datatypes/candlestick";
import {IShapeDataHolder} from "../../../../data/shape/transform/index";
import {ISeriesRenderer, ISeriesShape} from "../../../../series/render/base";
import {ISeriesRendererSettings} from "../index";
import {CartesianSeriesGroupRenderer} from "../group";
import {ICanvasChildShape} from "../../../../render/canvas/shape";
import {create} from "../../../../../config/di";
import {BaseCartesianRenderer} from "../base";
import {AreaIntervalShapeRenderer} from "../interval/area/shape";
import {IntervalColumnShapeRenderer} from "../interval/column/factory";

/**
 * @editor
 */
export interface ICandleShapeSettings extends ICartesianSeriesShapeSettings{

    type: "candle";

}

/*
class CandleSeriesRenderer extends SeriesRenderer{

    findShapesByIndex(data: any): ISeriesShape[] {
        return undefined;
    }

    highlight(): ICancellable {
        var s = this.seriesSettings.shape || "natural";
        var grp: IHighlightedDataGroup;
        switch(s){
            case "natural":
                grp = highlightDataNaturally(<CartesianSeries>this.series, (series) => {
                    throw new Error("No alternative highlighter");
                });
                break;
            default:
                throw new Error("Unknown shape "+s);
        }
        return new SeriesHighlightContext(<CartesianSeries>this.series, grp, this.center);
    }


    provideStyle(){
        var s = this.color.toString();
        return {
            fillStyle: s,
            strokeStyle: s
        }
    }



}
*/



export class CandleShapeRenderer extends CartesianSeriesGroupRenderer{

    series: IXYSeriesSystem

    constructor(settings: ISeriesRendererSettings){
        super(settings);
    }

    @create
    shapeFactory: (parent: CandleShapeRenderer, sd: IShapeDataHolder<ICandlestick> & ICandlestick) => CandlestickSeriesShape;
    create_shapeFactory(){
        var strokeClass = class Shape extends CandlestickSeriesShape{

        }
        strokeClass.prototype.draw = drawStroke;
        var fillClass = class Fill extends CandlestickSeriesShape{

        };
        if (this.series.colorScale.present){
            strokeClass.prototype.applyStyle = applyWithColorScale;
            strokeClass.prototype.unapplyStyle = unapplyWithColorScale;
            fillClass.prototype.applyStyle = applyWithColorScale;
            fillClass.prototype.unapplyStyle = unapplyWithColorScale;
        }
        return (parent: CandleShapeRenderer, sd: IShapeDataHolder<ICandlestick> & ICandlestick) =>{
            if(sd.close > sd.open){
                return new fillClass(sd, parent);
            }
            else {
                return new strokeClass(sd, parent);
            }
        };
    }

    create(parent: CandleShapeRenderer, sd: IShapeDataHolder<ICandlestick> & ICandlestick): ISeriesShape & ICanvasChildShape {
        return this.shapeFactory(parent, sd);
    }

    provideStyle(){
        var s = this.color.toString();
        return {
            fillStyle: s,
            strokeStyle: s
        }
    }


}

export class CandleGroupSeriesRenderer extends BaseCartesianRenderer{

    @create
    createRenderer(set: ISeriesRendererSettings): ISeriesRenderer {
        return new CandleShapeRenderer(set);
    }
}