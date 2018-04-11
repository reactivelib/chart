import {IEasingAnimator} from "../engine";
import {convertEasingValue, IValueEaserContext} from "./type";
import {IEaser, normalizeEaser} from "./func";
import {variable} from "@reactivelib/reactive";
import {IEasingSettings, IValueSettings} from "./index";

export class ValueEaser<E> implements IEasingAnimator, IValueEaserContext{

    public start: any;
    public end: any;
    public value: E;
    public time: number;
    public duration: number = 1000;
    public startTime: number = Date.now();
    public ease: IEaser;
    public finished = false;
    public onFinished(){
        
    }

    public easeValue: (ctx: IValueEaserContext) => E;

    constructor(){

    }

    public set(e: E){

    }

    public setTime(time: number){
        if (time >= this.startTime)
        {
            var t = Math.min(this.duration, time - this.startTime);
            this.time = t;
            var fin = (t === this.duration);
            this.finished = fin;
            if (fin)
            {
                this.value = this.end;
            }
            else {
                this.value = this.easeValue(this);
            }
            this.set(this.value);
        }
    }
}



export interface IValueEasingSettings<E> extends IEasingSettings, IValueSettings<E>{
    
    
    
}



export function createEaser<E>(settings: IValueEasingSettings<any>): IEasingAnimator{
    var easer = new ValueEaser<E>();
    var v = convertEasingValue(settings.value);
    easer.value = settings.value;
    easer.start = v.value;
    easer.easeValue = v.easeValue;
    easer.end = convertEasingValue(settings.end).value;
    var ef = settings.easing || "linear";
    var easing: IEaser = normalizeEaser(ef);
    easer.ease = easing;
    easer.set = settings.set;
    if (settings.duration){
        easer.duration = settings.duration;
    }
    if (settings.delay){
        easer.startTime += settings.delay;
    }
    return easer;
}