import {deps} from "../../../../../../config/di/index";
import { ICartesianSeries, IXYSeriesSystem, CartesianSeries } from "../../../series";
import {AbstractSeries} from "../../../../../series/index";
import {IStylable} from "../../../../../render/canvas/style/index";
import {ICanvasChildShape} from "../../../../../render/canvas/shape/index";
import pointHighlighter from './point';
import {highlightDataNaturally, IDataHighlighter, SeriesHighlightContext} from "../../data/highlight/highlight";
import {CartesianSeriesHighlightedDataGroup, IHighlightedDataGroup} from "../../data/highlight/group/shape/index";
import {ICartesianXInterval} from "../../../../../../datatypes/interval";
import {IShapeDataHolder} from "../../../../../data/shape/transform/index";
import {IPointHighlightSettings} from "../../../../../series/render/highlight";
import {ChartCenter} from "../../../../../core/center/index";

export type PointHighlighterFactory = (data: ICartesianXInterval, series: AbstractSeries, settings: IPointHighlightSettings) => IStylable & ICanvasChildShape;

function initPointGeneral(shape: IStylable, series: ICartesianSeries){
    var style = <any>{
        fillStyle: series.color.toString()
    }
    style.strokeStyle = "rgb(255, 255, 255)";
    style.strokeWidth = 2;
    shape.style = style;
}


function highlightByPoint(series: CartesianSeries, highlighter: (data: ICartesianXInterval) => ICanvasChildShape ): IHighlightedDataGroup{
    var grp = new CartesianSeriesHighlightedDataGroup(series, i => {
        var fd = <ICartesianXInterval & IShapeDataHolder<ICartesianXInterval>>series.shapeData.get(i);
        return highlighter(fd);
    });
    return grp;
}

export var IntervalHighlighterFactories = {
    pointHighlighter: () => {
        var highlighter: PointHighlighterFactory;
        highlighter = pointHighlighter();
        return highlighter;
    },
    
    factory: deps((pointHighlighter: PointHighlighterFactory, center: ChartCenter) => {
        return function highlightPoint(series: CartesianSeries, settings: IPointHighlightSettings = {}): IDataHighlighter{
            var s = settings.shape || "natural";
            var grp: IHighlightedDataGroup;
            switch(s){
                case "natural":
                    grp = highlightDataNaturally(series, (series: CartesianSeries) => {
                        return highlightByPoint(series, (data) => {
                            var s = pointHighlighter(data, <AbstractSeries><any>series, settings);
                            initPointGeneral(s, series);
                            return s;
                        });
                    });
                    break;
                case "point":
                    grp = highlightByPoint(series, (data) => {
                        var s = pointHighlighter(data, <AbstractSeries><any>series, settings);
                        initPointGeneral(s, series);
                        return s;
                    });
                    break;
                case "donut":
                    break;
                default:
                    throw new Error("Unknown shape "+s);
            }
            return new SeriesHighlightContext(series, grp, center);        }
    }, ["pointHighlighter", "center"])
};