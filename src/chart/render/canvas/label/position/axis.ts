/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterable} from "../../../../../collection/iterator/index";
import {
    createFormatterFromConfig,
    DecimalNumberFormatter,
    default as decimalFormat,
    IDecimalFormat
} from "../../../../../format/decimal";
import {SequenceLabelIterator} from "./interval";
import {IPositionedLabel} from "./index";
import {IFlexibleTickAxis} from "../../../../../math/domain/axis/axis";
import {ICalendar} from "../../../../../math/time/calendar";
import {getFormatterForUnit} from "../../../../../format/time/distance";
import {TimeUnits} from "../../../../../math/sequence/time";

export interface IGridLabelGeneratorSettings{
    format?: string | IGridLabelDecimalFormatSettings | ((n: number) => string);
    axis: IFlexibleTickAxis;

}

export interface IGridLabelDecimalFormatSettings extends IDecimalFormat{

    autoFraction?: boolean;
    init?: (axis: IFlexibleTickAxis, formatter: DecimalNumberFormatter) => void;
}

export function createGridLabelGenerator(this: void, settings: IGridLabelGeneratorSettings): IIterable<IPositionedLabel>{
    var format: DecimalNumberFormatter;
    var axis = settings.axis;
    var autoFraction = true;
    if (!settings.format){
        format = decimalFormat(",###.##");
    }
    else if (typeof settings.format === "string"){
        format = decimalFormat(settings.format);
    }
    else if (typeof settings.format === "function"){
        formatter = settings.format;
    }
    else
    {
        var conf = <IGridLabelDecimalFormatSettings> settings.format;
        format = createFormatterFromConfig(conf);
        if (conf.init){
            conf.init(settings.axis, format);
        }
        autoFraction = !("autoFraction" in conf) || conf.autoFraction;
    }
    var lastDist: number = null;
    if (!formatter){
        var formatter = (n: number) => {
            var dist = axis.ticks.distance;
            if (lastDist !== dist && autoFraction){
                lastDist = dist;
                var nr = 0;
                var seqs = (dist+"").split(".");
                if (seqs.length > 1){
                    nr = seqs[1].length;
                }
                format.fraction.minNr = nr;
                format.fraction.maxNr = nr;
            }
            return format.format(n);
        };
    }
    return {
        iterator: () => {
            return new SequenceLabelIterator(axis.ticks.iterator(axis.window.start, axis.window.end), n => formatter(n));
        }
    }
}

export interface ITimeGridLabelGeneratorSettings{
    axis: IFlexibleTickAxis;
    calendarFactory: (time: number) => ICalendar;
    timeUnit: () => TimeUnits;
}

export function createTimeGridLabelGenerator(settings: ITimeGridLabelGeneratorSettings){
    return {
        iterator: () => {
            var axis = settings.axis;
            var f = getFormatterForUnit(settings.calendarFactory, settings.timeUnit());
            return new SequenceLabelIterator(axis.ticks.iterator(axis.window.start, axis.window.end), n => f(n));
        }
    }
}