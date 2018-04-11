/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import dateFormatter from "../date";
import {nextSmallerUnit, TimeUnits} from "../../math/sequence/time";
import {ICalendar} from "../../math/time/calendar";


var unitToFormatter = {
    ms: "SSSms",
    s: "ss",
    m: "mm",
    h: "hh",
    d: "dd",
    M: "MMM",
    y: "yyyy",
    ydm: "yyyy-MM-dd",
    hms: "hh:mm:ss"
}

var formatYear = dateFormatter(unitToFormatter["y"]);
var formatMonth = dateFormatter(unitToFormatter["M"]);
var formatDay = dateFormatter(unitToFormatter["d"]);
var formatYDM = dateFormatter(unitToFormatter["ydm"]);
var formathms = dateFormatter(unitToFormatter["hms"]);
var formatms = dateFormatter(unitToFormatter["ms"]);

export interface ITimeFormatterSettings{
    calendarFactory: (time: number) => ICalendar;
}

function createYearFormatter(calendarFactory: (time: number) => ICalendar){
    return function(nn: number){
        return formatYear(calendarFactory(nn));
    }
}

function createMonthFormatter(calendarFactory: (time: number) => ICalendar){
    var lastYear: number = null;
    return function(nn: number){
        var d = calendarFactory(nn);
        if (d.year !== lastYear){
            lastYear = d.year;
            return formatYear(d);
        }
        lastYear = d.year;
        return formatMonth(d);
    }
}

function createDayFormatter(calendarFactory: (time: number) => ICalendar){
    var lastYear: number = null;
    var lastMonth: number = null;
    return function(nn: number){
        var d = calendarFactory(nn);
        if (d.year !== lastYear){
            lastYear = d.year;
            return formatYear(d);
        }
        if (d.month !== lastMonth){
            lastMonth = d.month;
            return formatMonth(d);
        }
        return formatDay(d);
    }
}

function createSecondFormatter(calendarFactory: (time: number) => ICalendar){
    var lastDay: number = null;
    return function(nn: number){
        var d = calendarFactory(nn);
        if (d.dayOfMonth !== lastDay){
            lastDay = d.dayOfMonth;
            return formatYDM(d);
        }
        return formathms(d);
    }
}

function createMSFormatter(calendarFactory: (time: number) => ICalendar){
    var lastDay: number = null;
    var lastSecond: number = null;
    return function(nn: number){
        var d = calendarFactory(nn);
        if (d.dayOfMonth !== lastDay){
            lastDay = d.dayOfMonth;
            return formatYDM(d);
        }
        if (d.seconds !== lastSecond){
            lastSecond = d.seconds;
            return formathms(d);
        }
        return formatms(d);
    }
}

var unitToFormatterFatory: {[s: string]: (calendarFactory: (time: number) => ICalendar) => (n: number) => string} = {
    y: createYearFormatter,
    M: createMonthFormatter,
    d: createDayFormatter,
    h: createSecondFormatter,
    m: createSecondFormatter,
    s: createSecondFormatter,
    ms: createMSFormatter
}

export function getFormatterForUnit(calendarFactory: (time: number) => ICalendar, unit: TimeUnits){
    return (unitToFormatterFatory)[unit](calendarFactory);
}