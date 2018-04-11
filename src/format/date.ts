/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {Scanner} from "./decimal";
import {ICalendar} from "../math/time/calendar";

function pad(str: string, length: number, pad: string){
    var res = str;
    while(res.length < length)
    {
        res = pad + res;
    }
    return res;
}

export interface IDateContext{
    getDayName(nr: number): string;
}

var formats = {
    d: (p: ICalendar) => p.dayOfMonth+"",
    dd: (p: ICalendar) => pad(p.dayOfMonth+"", 2, '0'),
    M: (p: ICalendar) => p.month+1+"",
    MM: (p: ICalendar) => pad(p.month+1+"", 2, '0'),
    yy: (p: ICalendar) => (p.year+"").substr(Math.min(2, (p.year+"").length - 2)),
    yyyy: (p: ICalendar) => pad(p.year+"", 4, '0'),
    mm: (p: ICalendar) => pad(p.minutes+"", 2, '0'),
    ss: (p: ICalendar) => pad(p.seconds+"", 2, '0'),
    SSS: (p: ICalendar) => pad(p.milliseconds+"", 3, '0'),
    hh: (p: ICalendar) => pad(p.hours+"", 2, '0')
}

export interface IDateFormatterSettings{
    calendarFactory?: (time: number) => ICalendar;
}

function parseDate(scanner: Scanner){
    var c = scanner.getCharacter();
    var converters: ((p: ICalendar, ctx: IDateContext) => string)[] = [];
    while(scanner.hasMore()){
        converters.push(parsePrimitive(scanner));
    }
    return converters;
}

function parsePrimitive(scanner: Scanner): (p: ICalendar, ctx: IDateContext) => string{
    switch(scanner.getCharacter()){
        case "d":
            return parseDayOfMonth(scanner);
        case "M":
            return parseMonth(scanner);
        case "y":
            return parseYear(scanner);
        case "m":
            return parseMinute(scanner);
        case "s":
            return parseSecond(scanner);
        case "S":
            return parseMs(scanner);
        case "h":
            return parseHour(scanner);
        case "'":
            return parseQuotedText(scanner);
        default:
            return parseNonQuotedText(scanner);
    }
}

function parseDayOfMonth(scanner: Scanner){
    scanner.advance();
    if (scanner.hasMore()){
        if (scanner.getCharacter() === "d"){
            scanner.advance();
            return (p: ICalendar) => pad(p.dayOfMonth+"", 2, '0');
        }
    }
    return (p: ICalendar) => p.dayOfMonth+"";
}

function parseMonth(scanner: Scanner): (c: ICalendar, ctx: IDateContext) => string{
    scanner.advance();
    if (scanner.hasMore()){
        if (scanner.getCharacter() === "M"){
            scanner.advance();
            if (scanner.hasMore()){
                if (scanner.getCharacter() === "M"){
                    scanner.advance();
                    return (p: ICalendar, ctx: IDateContext) => ctx.getDayName(p.month);
                }
            }
            return (p: ICalendar) => pad(p.month+1+"", 2, '0');
        }
    }
    return (p: ICalendar) => p.month+1+"";
}

function parseYear(scanner: Scanner){
    scanner.advance();
    if (scanner.hasMore()){
        if (scanner.getCharacter() === 'y'){
            scanner.advance();
            if (scanner.hasMore()){
                if (scanner.getCharacter() === 'y'){
                    scanner.advance();
                    if (scanner.hasMore()){
                        if (scanner.getCharacter() === 'y'){
                            scanner.advance();
                            return (p: ICalendar) => pad(p.year+"", 4, '0');
                        }
                    }
                    return () => 'yyy';
                }
            }
            return (p: ICalendar) => (p.year+"").substr(Math.min(2, (p.year+"").length - 2));
        }
    }
    return () => 'y';
}

function parseMinute(scanner: Scanner){
    scanner.advance();
    if (scanner.hasMore()){
        if (scanner.getCharacter() === "m"){
            scanner.advance();
            return (p: ICalendar) => pad(p.minutes+"", 2, '0');
        }
    }
    return (p: ICalendar) => "m";
}

function parseSecond(scanner: Scanner){
    scanner.advance();
    if (scanner.hasMore()){
        if (scanner.getCharacter() === "s"){
            scanner.advance();
            return (p: ICalendar) => pad(p.seconds+"", 2, '0');
        }
    }
    return () => "s";
}

function parseMs(scanner: Scanner){
    scanner.advance();
    if (scanner.hasMore()){
        if (scanner.getCharacter() === "S"){
            scanner.advance();
            if (scanner.hasMore()){
                if (scanner.getCharacter() === "S"){
                    scanner.advance();
                    return (p: ICalendar) => pad(p.milliseconds+"", 3, '0');
                }
            }
            return () => "SS";
        }
    }
    return () => "S";
}

function parseHour(scanner: Scanner){
    scanner.advance();
    if (scanner.hasMore()){
        if (scanner.getCharacter() === "h"){
            scanner.advance();
            return (p: ICalendar) => pad(p.hours+"", 2, '0');
        }
    }
    return () => "h";
}

function parseNonQuotedText(scanner: Scanner){
    var text = scanner.getCharacter();
    scanner.advance();
    while(scanner.hasMore()){
        switch (scanner.getCharacter()){
            case "d":
            case "M":
            case "y":
            case "m":
            case "s":
            case "S":
            case "h":
            case "'":
                return () => text;
            default:
                text += scanner.getCharacter();
                scanner.advance();
                break;
        }
    }
    return () => text;
}

function parseQuotedText(scanner: Scanner){
    var text = scanner.getCharacter();
    scanner.advance();
    while(scanner.hasMore()){
        switch (scanner.getCharacter()){
            case '\'':
                scanner.advance();
                return () => text;
            case '\\':
                if (scanner.hasMore()){
                    scanner.advance();
                    text += scanner.getCharacter();
                    scanner.advance();
                }
            default:
                text += scanner.getCharacter();
                scanner.advance();
        }
    }
    return () => text;
}

export class DateContext implements IDateContext{

    public months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    public getDayName(month: number){
        return this.months[month];
    }

}

export function createDateFormatter(format: string){
    return createFormatter(format);
}

export default function createFormatter(format: string){
    var sc = new Scanner();
    sc.pattern = format;
    var formatters = parseDate(sc);
    var ctx = new DateContext();
    return (calendar: ICalendar) => {
        var s = "";
        formatters.forEach(f => s += f(calendar, ctx));
        return s;
    }
}