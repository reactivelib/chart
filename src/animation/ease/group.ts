import {IEasingSettings, IValueSettings} from "./index";
import {IEaser, normalizeEaser} from "./func";
import {convertEasingValue, IValueEaserContext} from "./type";
import {variable} from "@reactivelib/reactive";

export class ValueEaser<E> implements IValueEaserContext{

    constructor(public easer: GroupEaser, public settings: IValueSettings<E>){

    }

    public start: any;
    public end: any;

    get value(){
        return this.settings.value;
    }

    get duration(){
        return this.easer.duration;
    }

    get startTime(){
        return this.easer.startTime;
    }

    get time(){
        return this.easer.time;
    }

    get ease(){
        return this.easer.ease;
    }

    public easeValue: (ctx: IValueEaserContext) => E;

    public set(val: any){
        this.settings.value = val;
        this.settings.set(val);
    }
}

export class GroupEaser implements IEasingSettings{

    public duration = 300;
    public startTime: number = Date.now();
    private r_finished: variable.IVariable<boolean> = variable(false);

    get finished(){
        return this.r_finished.value;
    }

    set finished(v){
        this.r_finished.value = v;
    }
    public time: number;
    public ease: IEaser;
    public values: ValueEaser<any>[];
    
    public onFinished(){
        
    }
    
    public onUpdate(){
        
    }
    
    public onStart(){
        
    }
    
    public first = true;

    public setTime(time: number){
        if (time >= this.startTime){
            if (this.first){
                this.onStart();
                this.first = false;
            }
            var t = Math.min(this.duration, time - this.startTime);
            this.time = t;
            var fin = (t === this.duration);
            this.finished = fin;
            if (fin)
            {
                for (var i=0; i < this.values.length; i++){
                    var v = this.values[i];
                    v.set(v.end);
                }
                this.onUpdate();
                this.onFinished();
            }
            else {
                for (var i=0; i < this.values.length; i++){
                    var v = this.values[i];
                    v.set(v.easeValue(v));
                }
                this.onUpdate();
            }
        }
    }

}

export interface IGroupEaserSettings extends IEasingSettings{

    values: IValueSettings<any>[];
    onFinished?: () => void;
    onUpdate?: () => void;
    onStart?: () => void;

}

export function createGroupEaser(settings: IGroupEaserSettings){
    var easer = new GroupEaser();
    if (settings.duration){
        easer.duration = settings.duration;
    }
    if (settings.delay){
        easer.startTime += settings.delay;
    }
    var ef = settings.easing || "linear";
    var easing: IEaser = normalizeEaser(ef);
    easer.ease = easing;
    easer.values = settings.values.map(v => {
        var ve = new ValueEaser(easer, v);
        var ev = convertEasingValue(v.value);
        ve.start = ev.value;
        ve.easeValue = ev.easeValue;
        ve.end = convertEasingValue(v.end).value;
        return ve;
    });
    if (settings.onFinished){
        easer.onFinished = settings.onFinished;
    }
    if (settings.onUpdate){
        easer.onUpdate = settings.onUpdate;
    }
    if (settings.onStart){
        easer.onStart = settings.onStart;
    }
    return easer;
}