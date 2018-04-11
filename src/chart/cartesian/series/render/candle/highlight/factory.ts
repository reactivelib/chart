import {deps} from "../../../../../../config/di/index";
import {CartesianSeries} from "../../../series";
import {highlightDataNaturally, IDataHighlighter, SeriesHighlightContext} from "../../data/highlight/highlight";
import {IHighlightedDataGroup} from "../../data/highlight/group/shape/index";
import {IDataHighlightSettings} from "../../../../../series/render/highlight";
import {ChartCenter} from "../../../../../core/center/index";

export var CandleHighlighterFactories = {
    
    factory: deps((center: ChartCenter) => {
        return function highlightPoint(series: CartesianSeries, settings: IDataHighlightSettings = {}): IDataHighlighter{
            var s = settings.shape || "natural";
            var grp: IHighlightedDataGroup;
            switch(s){
                case "natural":
                    grp = highlightDataNaturally(series, (series) => {
                        throw new Error("No alternative highlighter");
                    });
                    break;
                default:
                    throw new Error("Unknown shape "+s);
            }
            return new SeriesHighlightContext(series, grp, center);
        }
    }, ["center"])
};