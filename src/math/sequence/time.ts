import {base10List, ISequence, list} from "./index";

export var units: TimeUnits[] = ["ms", "s", "m", "h", "d", "M", "y"];

export type TimeUnits = "ms" | "s" | "m" | "h" | "d" | "M" | "y";

export var unitToMs = {
    "ms": 1,
    "s": 1000,
    "m": 60 * 1000,
    "h": 60 * 60 * 1000,
    "d": 24 * 60 * 60 * 1000,
    "M": 31556952000 / 12,
    "y": 31556952000
}

export interface IIntervalUnitList{
    ms: number[];
    s: number[];
    m: number[];
    h: number[];
    d: number[];
    M: number[];
    y: number[];
    
}

export interface ISequenceUnitList{
    ms: ISequence<number>;
    s: ISequence<number>;
    m: ISequence<number>;
    h: ISequence<number>;
    d: ISequence<number>;
    M: ISequence<number>;
    y: ISequence<number>;

}

export function nextSmallerUnit(time: number): TimeUnits{
    for (var i = 0; i < units.length; i++){
        var u = units[i];
        var ms: number = (<any>unitToMs)[u];
        if (ms > time){
            break;
        }
    }
    i = Math.max(0, i-1);
    return units[i];
}

export class UnitSequence{
    
    constructor(public unitList: number[], public timeToUnit: {[s: string]: string}){
        
    }
    
    public unitListSeq = list(this.unitList);

    public nearest(v: number): string{
        return this.timeToUnit[this.unitListSeq.nearest(v)];
    }

    public next(v: number): string{
        return this.timeToUnit[this.unitListSeq.next(v)];
    }

    public previous(v: number): string{
        return this.timeToUnit[this.unitListSeq.previous(v)];
    }
}

export class TimeSequence implements ISequence<number>{
    
    public unitList: number[];
    public timeToUnit: {[s: string]: string};
    public unitSequence: UnitSequence;
    public unitToSequence: ISequenceUnitList;
    
    constructor(public unitIntervals: IIntervalUnitList){
        var unitToSequence = {
            ms: base10List(unitIntervals.ms),
            s: list(unitIntervals.s),
            m: list(unitIntervals.m),
            h: list(unitIntervals.h),
            d: list(unitIntervals.d),
            M: list(unitIntervals.M),
            y: base10List(unitIntervals.y)

        }
        var unitList = [500];
        var timeToUnit = {
            "500": "ms",
            "31556952000": "y"
        }
        for (var i=1; i < units.length; i++){
            var u = units[i];
            var l = (<any>unitIntervals)[u];
            var ms = (<any>unitToMs)[u];
            for (var j=0; j < l.length; j++){
                var t = ms * l[j];
                unitList.push(t);
                (<any>timeToUnit)[t] = u;
            }
        }
        this.unitList = unitList;
        this.timeToUnit = timeToUnit;
        this.unitSequence = new UnitSequence(this.unitList, this.timeToUnit);
        this.unitToSequence = unitToSequence;
    }

    public nearest(time: number): number{
        var unit = this.unitSequence.nearest(time);
        var ms = (<any>unitToMs)[unit];
        var unitTime = time / ms;
        var sequence = (<any>this.unitToSequence)[unit];
        var t = sequence.nearest(unitTime);
        return t * ms;
    }

    public next(time: number): number{
        var unit = this.unitSequence.next(time);
        var ms = (<any>unitToMs)[unit];
        var unitTime = time / ms;
        var sequence = (<any>this.unitToSequence)[unit];
        return sequence.next(unitTime) * ms;
    }

    public previous(time: number): number{
        var unit = this.unitSequence.previous(time);
        var ms = (<any>unitToMs)[unit];
        var unitTime = time / ms;
        var sequence = (<any>this.unitToSequence)[unit];
        return sequence.previous(unitTime) * ms;
    }

    public compare(a: number, b: number){
        return a - b;
    }

}

export var timeSequence = new TimeSequence({
    ms: [1, 2, 5],
    s: [1, 2, 5, 10, 15, 20, 30],
    m: [1, 2, 5, 10, 15, 20, 30],
    h: [1, 2, 3, 6, 12],
    d: [1, 2, 5, 10, 15],
    M: [1, 2, 3, 4, 6],
    y: [1, 2, 5]
});