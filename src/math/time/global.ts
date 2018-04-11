import {DateLocalTimeCalendar, ICalendar, UTCOffsetCalendar} from "./calendar";

export var calendarOffset: any = "local";

export function getCalendar(time: number): ICalendar{
    if (calendarOffset === "local"){
        return new DateLocalTimeCalendar(time);
    }
    else{
        var cal = new UTCOffsetCalendar(time);
        cal.offset = calendarOffset;
        return cal;
    }

}