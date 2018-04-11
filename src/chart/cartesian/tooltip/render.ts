/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPoint} from "../../../geometry/point/index";
import {ISeriesFocusData, IXYFocus} from "../focus/index";
import {IIntervalData} from "../../../datatypes/interval";
import {ICandlestick} from "../../../datatypes/candlestick";
import {ICartesianChartSettings, XYChart} from "../index";
import {getEndX} from "../../../datatypes/range";
import {IDiscreteXYAxis, IXYAxis} from "../axis/index";
import {createDateFormatter} from "../../../format/date";
import {TimeFlexibleMarkers} from "../../../math/domain/axis/time";
import {DateLocalTimeCalendar} from "../../../math/time/calendar";
import {IXYTooltipSettings} from "./index";
import {createTooltipContentCreator, ITooltipTableContentSettings} from "../../render/canvas/shape/tooltip/content";
import {IGlobalChartSettings} from "../../style";
import {extend} from "@reactivelib/core";
import { variable } from "@reactivelib/reactive";
import {deps} from "../../../config/di";

function getCandleDecimalCell(content: any,  val: number){
    return content.td({
        child: content.decimal({
            value: val
        })
    })
}

function getIntervalCell(content: any, s: number, e: number){
    return content.td({
        child: content.decimal({
            value: s+" - "+e
        })
    });
}

function getFormatterForDataTypeForX(content: any, type: string): (data: any) => any{
    switch(type){
        case "point":
            return (data: IPoint) => {
                return getCandleDecimalCell(content, data.y);
            }
        case "interval":
            return (data: IIntervalData) => {
                return getIntervalCell(content, data.y, data.ye);
            }
        case "candle":
            return (data: ICandlestick) => {
                return content.table({
                    child: [content.tr({
                        child: [content.th({
                            child: "open"
                        }),content.th({
                            child: "high"
                        }),content.th({
                            child: "low",
                        }),content.th({
                            child: "close"
                        })]
                    }),content.tr({
                        child: [getCandleDecimalCell(content, data.open), getCandleDecimalCell(content, data.high), getCandleDecimalCell(content, data.low), getCandleDecimalCell(content, data.close)]
                    })]
                })
            }
        default:
            throw new Error("Unknown data type "+type);
    }
}

function getFormatterForDataTypeForXY(content: any, type: string): (data: any) => any{
    switch(type){
        case "point":
            return (data: IPoint) => {
                return content.td({
                    child: data.x+", "+data.y 
                })
            }
        default:
            throw new Error("Unknown data type "+type);
    }
}

function renderTooltip(content: any, focus: IXYFocus, settings: IXYTooltipSettings){
    return content.div({
        child: content.table({
            child: [content.tbody({
                child: renderDataRows(focus.focusedData, settings.filterDuplicates, settings.renderRow || ((s: any) => renderDefaultRow(content, s, (type: string) => getFormatterForDataTypeForXY(content, type))))
            })]
        })
    });
}

function renderDataRows(data: ISeriesFocusData[], filter: boolean, renderRow: (data: ISeriesFocusData) => any){
    var seriesRows: any[] = [];
    var labels: any = {};
    data.forEach(sd => {
        var seriesLabel = sd.series.label;
        if (filter){
            if (seriesLabel in labels){
                return;
            }
        }
        labels[seriesLabel] = {};
        seriesRows.push(renderRow(sd));
    });
    return seriesRows;
}

//export type TimeUnits = "ms" | "s" | "m" | "h" | "d" | "M" | "y";

var unitToFormatter: any = {
    "ms": () => createDateFormatter("SSSms"),
    "s": () => createDateFormatter("hh:mm:ss"),
    "m": () => createDateFormatter("hh:mm:ss"),
    "h": () => createDateFormatter("hh:mm:ss"),
    "d": () => createDateFormatter("yyyy-MM-dd"),
    "M": () => createDateFormatter("yyyy-MM-dd"),
    "y": () => createDateFormatter("yyyy-MM-dd"),
    "default": () => createDateFormatter("yyyy-MM-dd hh:mm:ss")
    
}


function getLabel(indx: number, axis: IXYAxis){
    if (axis.type === "discrete"){
        var cat = (<IDiscreteXYAxis> axis).categories.getByIndex(indx);
        if ((<IDiscreteXYAxis> axis).time.active){
            var formatter = unitToFormatter[axis.time.unit || "default"]();
            if (cat){
                var f = formatter(new DateLocalTimeCalendar(cat.id));
                return f;
            }
            return null;
        }
        if (cat){
            return cat.label || cat.id;
        }
        return null;
    }
    if (axis.ticks instanceof TimeFlexibleMarkers){
        var formatter = unitToFormatter[axis.time.unit || "default"]();
        var f = formatter(new DateLocalTimeCalendar(indx));
        return f+"";
    }
    else {
        return indx+"";
    }

}

function renderSingleLabel(content: any, l: string){
    return content.tr({
        child: content.td({
            style: {
                textAlign: "center",
            },
            attr: {
                "colspan": "100"
            },
            child: [l]
        })
    })
}

function renderLabel(content: any, start: string, end: string){
    if (start){
        if (!end){
            return renderSingleLabel(content, start);
        }
        return renderSingleLabel(content,start +" - "+end);
    }
    if (end){
        return renderSingleLabel(content, end);
    }
    return null;
}

function renderLabelRows(content: any, focus: IXYFocus){
    var xs = Number.MAX_VALUE;
    var xe = -Number.MAX_VALUE;
    var xAxes: IXYAxis[] = [];
    focus.focusedData.forEach(d => {
        xs = Math.min(xs, d.data.x);
        xe = Math.max(xe, getEndX(d.data));
        if (xAxes.lastIndexOf(d.series.xAxis) < 0){
            xAxes.push(d.series.xAxis);
        }
    });
    var rows: any[] = [];
    xAxes.forEach(ax => {
        var sl = getLabel(xs, ax);
        if (xe !== xs){
            var el = getLabel(xe, ax);
        }
        var lr = renderLabel(content, sl, el);
        if (lr){
            rows.push(lr);
        }
    });
    return rows;
}

function createContentCreator(settings: ITooltipTableContentSettings){
    return createTooltipContentCreator(settings);
}


function renderTooltipForX(ttContent: any, focus: IXYFocus, settings: IXYTooltipSettings){
    var labels = renderLabelRows(ttContent, focus);
    if (labels.length > 0){
        labels[0].style = {
            borderTop: "1px solid black"
        };
    }
    return ttContent.div({
        child: ttContent.table({
            child: [ttContent.tbody({
                child: renderDataRows(focus.focusedData, settings.filterDuplicates, settings.renderRow || ((s) => renderDefaultRow(ttContent, s, (s) => getFormatterForDataTypeForX(ttContent, s))))
            }), 
                ttContent.tfoot({
                    child: labels
                })]
        })
    });
}

function renderDefaultRow(content: any, sd: ISeriesFocusData, getFormatter: (d: any) => any){
    var seriesLabel = sd.series.label;
    var data = sd.data;
    var dt = sd.series.dataType;
    var formatter = getFormatter(dt);
    return content.tr({
        child: [content.th({
            child: seriesLabel
        }),formatter(data)]
    });
}

export function createDefaultRenderer(chart: XYChart, settings: ICartesianChartSettings, tooltipSettings: variable.IVariable<IXYTooltipSettings>, theme: IGlobalChartSettings): (f: IXYFocus) => any{
    var rend = variable<(f: IXYFocus) => any>(null).listener(v => {
        var ttContent = createContentCreator(extend.deep({
            th: {
                style:{
                    whiteSpace: "nowrap"
                }
            },
            table: {
                style: {
                    backgroundColor: "transparent"
                }
            }
        }, theme.tooltip && theme.tooltip.content, settings.tooltip && settings.tooltip.content));
        if (settings.type === "x"){
            v.value = (f) => renderTooltipForX(ttContent, f, tooltipSettings.value);
        }
        else {
            v.value = (f) => renderTooltip(ttContent, f, tooltipSettings.value);
        }
    });  
    chart.cancels.push(rend.$r);
    return function(f: IXYFocus){
        return rend.value(f);
    }
}