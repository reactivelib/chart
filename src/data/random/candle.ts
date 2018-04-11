/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICalendar} from "../../math/time/calendar";
import {createRandomWalkData} from "./value";
import {IVolumeCandlestick} from "../../datatypes/candlestick";

export interface IRandomCandleDataSettings{

    start: ICalendar;
    end: ICalendar;
    startTime: ICalendar;
    endTime: ICalendar;
    minVolume: number;
    maxVolume: number;
    minPrice: number;
    maxPrice: number;
    rounder?: (n: number) => number;
    interval: string;
    calendarFactory: (time: number) => ICalendar;

}

/*
export function generateRandomCandlestickData(settings: IRandomCandleDataSettings): IVolumeCandlestick[]{
    var ivl: number;
    switch (settings.interval){
        case "s":
            ivl = 1000;
            break;
        case "m":
            ivl = 1000*60;
            break;
        case "h":
            ivl = 1000*60*60;
            break;
        default:
            ivl = 1000*60*60*24;
            break;
    }
    var pointToCandleConverter = new PointToCandleConverter();
    pointToCandleConverter.interval = settings.interval;
    pointToCandleConverter.calendarFactory = settings.calendarFactory;
    var prices = createRandomWalkData({
        start: settings.start.time,
        end: settings.end.time,
        min: settings.minPrice,
        max: settings.maxPrice,
        maxAdd: (settings.maxPrice - settings.minPrice) / 1000,
        distance: (ivl / 100),
        rounder: settings.rounder
    });
    var res: IVolumeCandlestick[] = [];
    pointToCandleConverter.onNewCandle.observe(c => {
        var vol = Math.round(Math.random()*(settings.maxVolume - settings.minVolume) + settings.minVolume);
        var vc = <IVolumeCandlestick>c;
        vc.volume = vol;
        res.push(vc);
    });
    while(prices.hasNext()){
        var p = prices.next();
        var ct = settings.calendarFactory(p.x);
        var sd = settings.calendarFactory(ct.time);
        sd.seconds = settings.startTime.seconds;
        sd.minutes = settings.startTime.minutes;
        sd.milliseconds = settings.startTime.milliseconds;
        sd.hours = settings.startTime.hours;
        var ed = settings.calendarFactory(ct.time);
        ed.seconds = settings.endTime.seconds;
        ed.minutes = settings.endTime.minutes;
        ed.milliseconds = settings.endTime.milliseconds;
        ed.hours = settings.endTime.hours;
        if (ct.time >= sd.time && ct.time <= ed.time) {
            pointToCandleConverter.next(p);
        }
        else {
            prices.undoYChange();
        }
    }
    pointToCandleConverter.finish();
    return res;
}

*/