import {IEasingSettings, IValueSettings} from "./ease/index";
import {animateValueGroup, IEasingAnimation} from "./engine";
import {ICancellable} from "@reactivelib/reactive";
import {IGroupEaserSettings} from "./ease/group";

export interface IObjectEasing extends IEasingSettings{
    from: any;
    to: any;
    onStart?: () => void;
    onFinished?: () => void;
    onUpdate?: () => void;
}

export interface IObjectEasingResult{
    then(settings: IObjectEasing): IObjectEasingResult;
    loop(): ICancellable;
    cancel(): void;
}

class ObjectEasingResult implements IObjectEasingResult{
    
    public anim: IEasingAnimation;
    public settings: IGroupEaserSettings;
    public next: ObjectEasingResult;
    
    constructor(public e: IObjectEasing, public parent: ObjectEasingResult = null){
        this.settings = {
            values: [],
            onFinished: () => {
                if (e.onFinished){
                    e.onFinished();
                }
                this.onFinished();
            },
            onUpdate: e.onUpdate,
            delay: e.delay,
            easing: e.easing,
            duration: e.duration,
            onStart: e.onStart
        };
    }
    
    public onFinished(){
        this.next && this.next.start();
    }
    
    public start(){
        var values: IValueSettings<any>[] = [];
        var e = this.e;
        var to = e.to;
        for (var p in to){
            var ease = <any>{
                value: e.from[p],
                end: e.to[p],
                p: p,
                from: e.from,
                set: function(val: any){
                    this.from[this.p] = val;
                }
            };
            values.push(ease);
        }
        this.settings.values = values;
        this.anim = animateValueGroup(this.settings);
    }
    
    public restart(){
        if (this.parent){
            this.parent.restart();
            return;
        }
        this.start();
    }
    
    public then(settings: IObjectEasing){
        var r =  new ObjectEasingResult(settings, this);
        this.next = r;
        return r;
    }
    
    public loop(){
        this.onFinished = function(){
            this.restart();
        }
        return {
            cancel: () => {
                this.cancel();
            }
        }
    }
    
    public cancel(){
        if (this.parent){
            this.parent.cancel();
        }
        if (this.anim){
            this.anim.finished = true;
        }
    }
    
}

export default function objectEase(e: IObjectEasing): IObjectEasingResult{
    var res = new ObjectEasingResult(e);
    res.start();
    return res;
}