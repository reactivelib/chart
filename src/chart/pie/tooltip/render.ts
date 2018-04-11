/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {PieChart} from "..";
import {IPieChartSettings} from "../factory";
import {IGlobalChartSettings} from "../../style";
import {IPieChartFocus} from "../focus";
import {variable} from "@reactivelib/reactive";
import {extend} from "@reactivelib/core";
import {createTooltipContentCreator} from "../../render/canvas/shape/tooltip/content";


function renderTooltip(ttContent: any, focus: IPieChartFocus, settings: IPieChartSettings){
    var d = focus.nearestData.series.data.get(focus.nearestData.index);
    var data = ttContent.tr({
        child: ttContent.td({
            child: d.y+""
        })
    });
    var cont = ttContent.div({
        child: ttContent.table({
            child: [ttContent.tbody({
                child: data
            })]
        })
    });
    if ("l" in d){
        cont.child.child.push(ttContent.tfoot({
            child: ttContent.tr({
                child: ttContent.th({
                    child: d.l
                })
            })
        }));
    }
    return cont;
}

export default function(chart: PieChart, settings: IPieChartSettings, theme: IGlobalChartSettings): (f: IPieChartFocus) => any {
    var rend = variable<(f: IPieChartFocus) => any>(null).listener(v => {
        var ttContent = createTooltipContentCreator(extend.deep({
            th: {
                style: {
                    whiteSpace: "nowrap"
                }
            },
            table: {
                style: {
                    backgroundColor: "transparent"
                }
            }
        }, theme.tooltip && theme.tooltip.content, settings.tooltip && settings.tooltip.content));
        v.value = function (f: IPieChartFocus) {
            return renderTooltip(ttContent, chart.focus, settings);
        }

    });
    chart.cancels.push(rend.$r);
    return function (f: IPieChartFocus) {
        return rend.value(f);
    }
}