import {FlexibleDistanceTicks} from "../marker/base";
import {ICalendar} from "../../time/calendar";
import {nextSmallerUnit, timeSequence, unitToMs} from "../../sequence/time";
import {ISequence, rounded} from "../../sequence/index";

export class TimeFlexibleMarkers extends FlexibleDistanceTicks{

    constructor(public calendarFactory: (time: number) => ICalendar){
        super();
        this.distanceSequence = timeSequence;
    }

    public unit: string;
    private yearlySequence = rounded(1);

    private estimateDecimalPositions(minDistance: number, sequence: ISequence<number>){
        var n = sequence.next(minDistance);
        var p = sequence.previous(n);
        if (p !== minDistance)
        {
            minDistance = n;
        }
        return minDistance;
    }

    protected setDistance(v: number){
        var dist = super.setDistance(v);
        this.unit = nextSmallerUnit(dist);
        switch(this.unit){
            case "y":
            case "M":
                this.yearlySequence.distance = this.estimateDecimalPositions(dist / unitToMs[this.unit], timeSequence.unitToSequence[this.unit]);
                break;
            default:
                break;
        }
        return dist;
    }

    public nearest(pos: number){
        var n = this.next(pos);
        var p = this.previous(n);
        if (p === pos){
            return p;
        }
        p = this.previous(pos);
        if (Math.abs(pos - p) <= Math.abs(pos - n)){
            return p;
        }
        return n;
    }

    public resetCalendarToYearStart(cal: ICalendar){
        cal.month = 0;
        this.resetCalendarToMonthStart(cal);
    }

    public resetCalendarToMonthStart(cal: ICalendar){
        cal.dayOfMonth = 1;
        cal.hours = 0;
        cal.minutes = 0;
        cal.seconds = 0;
        cal.milliseconds = 0;
    }

    public next(pos: number){
        switch (this.unit){
            case "y":
                var cal = this.calendarFactory(pos);
                this.resetCalendarToYearStart(cal);
                cal.year = this.yearlySequence.next(cal.year);
                return cal.time;
            case "M":
                cal = this.calendarFactory(pos);
                this.resetCalendarToMonthStart(cal);
                var m = this.yearlySequence.next(cal.month);
                cal.month = m;
                return cal.time;
            default:
                return super.next(pos);
        }
    }

    public previous(pos: number){
        switch (this.unit){
            case "y":
                var cal = this.calendarFactory(pos);
                if (cal.month > 0 || cal.dayOfMonth > 1 || cal.hours > 0 || cal.minutes > 0 || cal.seconds > 0 || cal.milliseconds > 0){
                    this.resetCalendarToYearStart(cal);
                }
                else
                {
                    cal.year = this.yearlySequence.previous(cal.year);
                }
                return cal.time;
            case "M":
                cal = this.calendarFactory(pos);
                if (cal.dayOfMonth > 1 || cal.hours > 0 || cal.minutes > 0 || cal.seconds > 0 || cal.milliseconds > 0){
                    this.resetCalendarToMonthStart(cal);
                    var p = this.yearlySequence.previous(cal.month);
                    var n = this.yearlySequence.next(p);
                    if (n !== cal.month){
                        cal.month = p;
                    }
                }
                else
                {
                    var m = this.yearlySequence.previous(cal.month);
                    cal.month = m;
                }
                return cal.time;
            default:
                return  super.previous(pos);
        }
    }

}