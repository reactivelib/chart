/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IXYFocusSettings, XYFocus} from "./index";
import {procedure} from "@reactivelib/reactive";
import {IXYSeriesData, IXYSeriesSystem} from "../series/series";
import {XYChart} from "../index";
import {IChartDataHighlighter} from "../series/render/data/highlight/highlight";
import {MultiStarter} from "../../../config/start";
import {IGroupable} from "../../../datatypes/group";
import {variable} from "@reactivelib/reactive";
import {autoStart, deps} from "../../../config/di";

export default function xyFocusHighlight(focus: XYFocus, chart: XYChart, focusSettings: variable.IVariable<IXYFocusSettings>, starter: MultiStarter){
    var last: IChartDataHighlighter = null;
    starter.add(() => {
        return procedure(() => {
            var fs = focusSettings.value;
            var filter = (fs.highlight && fs.highlight.filter) || ((n) => n);
            if (focus.nearestData){
                if (!last){
                    last = chart.createHighlighter(fs.highlight);
                }
                var toHighlight: IXYSeriesData[] = filter(focus.focusedData).slice();
                if (focus.isOver){
                    var d = focus.nearestData.data;
                    var g = (<IGroupable>d).g;
                    if (g){
                        chart.series.collection.forEach((ser: IXYSeriesSystem) => {
                            if (ser === focus.nearestData.series){
                                var indx = focus.nearestData.index;
                            }
                            else {
                                indx = -1;
                            }
                            var sd = ser.shapeData;
                            for (var i=0; i < sd.length; i++){
                                var md = sd.get(i).data;
                                if (indx !== i){
                                    if ((<IGroupable>md).g === g){
                                        toHighlight.push({
                                            index: ser.shapeDataProvider.shapeToDataIndex(i),
                                            series: ser
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
                last.highlight(toHighlight);
            }
            else {
                if (last){
                    last.cancel();
                    last = null;
                }
            }
        });
    });
}