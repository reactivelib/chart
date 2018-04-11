import {deps} from "../../../../../../config/di/index";
import {CartesianSeries, IXYSeriesSystem} from "../../../series";
import {extend, IOptional} from "@reactivelib/core";
import {StackedShapesDataManager} from "../../../../../data/shape/cartesian/transformer/x/stacking";
import {ICartesianPointDataHolder} from "../../../../../data/shape/transform/cartesian/point/index";
import {ICartesianXPoint} from "../../../../../../datatypes/value";
import {AbstractSeries} from "../../../../../series/index";
import {IStylable} from "../../../../../render/canvas/style/index";
import {ICanvasChildShape} from "../../../../../render/canvas/shape/index";
import pointHighlighter from './point';
import donutHighlighter from './donut';
import {highlightDataNaturally, IDataHighlighter, SeriesHighlightContext} from "../../data/highlight/highlight";
import {CartesianSeriesHighlightedDataGroup, IHighlightedDataGroup} from "../../data/highlight/group/shape/index";
import {
    IDataHighlightSettings,
    IDonutHighlightSettings,
    IPointHighlightSettings
} from "../../../../../series/render/highlight";
import {ChartCenter} from "../../../../../core/center/index";

export type PointHighlighterFactory = (data: ICartesianPointDataHolder, series: AbstractSeries) => IStylable & ICanvasChildShape;

function highlightByPoint(series: IXYSeriesSystem, highlighter: (data: ICartesianPointDataHolder) => ICanvasChildShape ): IHighlightedDataGroup{
    var grp = new CartesianSeriesHighlightedDataGroup(series, i => {
        var fd = <ICartesianPointDataHolder>series.shapeData.get(i);
        return highlighter(fd);
    });
    return grp;
}

export var PointHighlighterFactories = {
    pointHighlighter: deps((series: IXYSeriesSystem, stack: IOptional<StackedShapesDataManager<ICartesianXPoint>>) => {
        return function(settings: IPointHighlightSettings){
            var highlighter: PointHighlighterFactory;
            highlighter = pointHighlighter({
                yEnd: stack.present
            }, extend({
                style: {
                    strokeStyle: "white",
                    fillStyle: series.color.toString()
                }
            }, settings));
            return highlighter;
        }
        
    }, ["series", "stack"]),
    
    donutHighlighter: deps((series: IXYSeriesSystem, stack: IOptional<StackedShapesDataManager<ICartesianXPoint>>) => {
        return (settings: IDonutHighlightSettings) => {
            var highlighter: PointHighlighterFactory;
            highlighter = donutHighlighter({
                yEnd: stack.present
            }, extend({
                style: {
                    strokeStyle: "white",
                    fillStyle: series.color.toString()
                }
            }, settings));
            return highlighter;
        }
    }, ["series", "stack"]),
    
    factory: deps((pointHighlighter: (settings: IPointHighlightSettings) => PointHighlighterFactory, donutHighlighter: (settings: IDonutHighlightSettings) => PointHighlighterFactory, center: ChartCenter) => {
        return function highlightPoint(series: CartesianSeries, settings: IDataHighlightSettings = {}): IDataHighlighter{
            var s = settings.shape || "default";
            var grp: IHighlightedDataGroup;
            switch(s){
                case "default":
                    grp = highlightDataNaturally(series, (series) => {
                        return highlightByPoint(series, (data) => {
                            var s = pointHighlighter(<IPointHighlightSettings>settings)(data, <AbstractSeries><any>series);
                            return s;
                        });
                    });
                    break;
                case "point":
                    grp = highlightByPoint(series, (data) => {
                        var s = pointHighlighter(<IPointHighlightSettings>settings)(data, <AbstractSeries><any>series);
                        return s;
                    });
                    break;
                case "donut":
                    grp = highlightByPoint(series, (data) => {
                        var s = donutHighlighter(<IDonutHighlightSettings> settings)(data, <AbstractSeries><any>series);
                        return s;
                    });
                    break;
                default:
                    throw new Error("Unknown shape "+s);
            }
            return new SeriesHighlightContext(series, grp, center);
        }
    }, ["pointHighlighter", "donutHighlighter", "center"])
};