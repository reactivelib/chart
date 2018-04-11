import {variable} from "@reactivelib/reactive";
import {animateValue, IEasingAnimation} from "../../../animation/engine";
import {unobserved} from "@reactivelib/reactive";
import {EasingType} from "../../../animation/ease/func";
import {procedure} from "@reactivelib/reactive";

export class Transition {

    public duration = 0;
    public timingFunction: EasingType = "linear";
    public delay = 0;

    public animate(property: string, style: any, endValue: any): IEasingAnimation {
        var endP: any = {};
        endP[property] = endValue;
        var self = this;
        return unobserved(function () {
            return animateValue({
                set: (v) => {
                    style[property] = v;
                },
                value: style[property],
                delay: self.delay,
                duration: self.duration,
                easing: self.timingFunction,
                end: endValue
            });
        });
    }
}

var transitionIgnores = {
    transition: true,
    transitionProperty: true,
    transitionTimingFunction: true,
    transitionDuration: true,
    transitionDelay: true,
    scale: true,
    translate: true
}

export function parseTime(time: string){
    var t = parseFloat(time);
    var last = time[time.length - 1];
    if (last === "s" && time[time.length - 2] !== 'm'){
        t *= 1000;
    }
    else if (last === "m"){
        t *= 60 * 1000;
    }
    else if (last === "h"){
        t *= 1000 * 60 * 60;
    }
    return t;
}

export class Transitions {

    public propToTransition: any = {};

    public get(prop: string) {
        if (prop in transitionIgnores) {
            return null;
        }
        if (prop in this.propToTransition) {
            return this.propToTransition[prop];
        }
        if (this.propToTransition.all) {
            return this.propToTransition.all;
        }
        return null;
    }

}

function parseTransitions(style: any){
    var trans = new Transitions();
    if (style.transition){
        var transitions = style.transition.split(",");
        for (var i=0; i < transitions.length; i++){
            var settings = transitions[i].trim().split(/\s+/);
            var prop = settings[0];
            var tran = new Transition();
            trans.propToTransition[prop] = tran;
            if (settings.length > 1){
                var duration = parseTime(settings[1]);
                tran.duration = duration;
            }
            if (settings.length > 2){
                var timingFunction = settings[2];
                tran.timingFunction = timingFunction;
            }
            if(settings.length > 3){
                var delay = parseTime(settings[3]);
                tran.delay = delay;
            }
        }
    }
    var transitionProperties = [];
    if (style.transitionProperty){
        var props = style.transitionProperty.split(/\s+/);
        for (var i=0; i < props.length; i++)
        {
            var p = props[i];
            if (!(p in trans.propToTransition)){
                trans.propToTransition[p] = new Transition();
            }
            transitionProperties[i] = trans.propToTransition[p];
        }
    }
    if (style.transitionTimingFunction){
        var timing = style.transitionTimingFunction.split(/\s+/);
        for (var i=0; i < Math.min(timing.length, transitionProperties.length); i++){
            var p = timing[i];
            transitionProperties[i].timingFunction = p;
        }
    }
    if (style.transitionDelay){
        var delays = style.transitionDelay.split(/\s+/);
        for (var i=0; i < Math.min(delays.length, transitionProperties.length); i++){
            var pp = parseTime(delays[i]);
            transitionProperties[i].delay = pp;
        }
    }
    if (style.transitionDuration){
        var durs = style.transitionDuration.split(/\s+/);
        for (var i=0; i < Math.min(durs.length, transitionProperties.length); i++){
            var ppp = parseTime(durs[i]);
            transitionProperties[i].duration = ppp;
        }
    }
    return trans;
}

function parseTransforms(style: any){
    var transforms = {};
    if (style.transform){
        transforms = (style.transform.match(/([\w]+)\(([^\)]+)\)/g)||[])
            .map(function(it: string){return it.replace(/\)$/,"").split(/\(/)})
            .reduce(function(m: any,it: string){return m[it[0].trim()]= it[1],m},{})
    }
    return transforms;
}

var ctxStyleMappings = {
    backgroundColor: "fillStyle",
    borderColor: "strokeStyle",
    borderWidth: "lineWidth",
    opacity: "globalAlpha"
}

export interface ITransitionInfo{
    type: number;
    transition?: Transition;
    value: any;
    cancel?(): void;
}

export class ComposedStyleTransitions {

    public rStyle: variable.IVariable<any> = variable(null);
    public rEndValues: variable.IVariable<any> = variable({});
    public rEndTransition: variable.IVariable<any> = variable({});
    private lastProc: procedure.IProcedure;
    
    private recalculate(){
        this.lastProc = procedure(() => {
            var s = this.style;
            if (!s) {
                this.rEndValues.value = {};
                this.rEndTransition.value = {};
                return;
            }
            var t = parseTransitions(s);
            var transform: any = parseTransforms(s);
            var end: any = {};
            for (var p in s) {
                var m = (<any>ctxStyleMappings)[p] || p;
                var transition = t.get(m);
                if (transition && p !== "transform") {
                    end[m] = {
                        type: 2,
                        value: s[p],
                        transition: transition
                    }
                }
                else {
                    end[m] = {
                        type: 1,
                        value: s[p]
                    };
                }
            }
            for (var trans in transform) {
                try {
                    switch (trans) {
                        case "scaleX":
                            var val = parseFloat(transform[trans]);
                            this.setScale(end, t, val, null);
                            break;
                        case "scaleY":
                            var val = parseFloat(transform[trans]);
                            this.setScale(end, t, null, val);
                            break;
                        case "scale":
                            var vals = transform[trans].split(",");
                            var x = parseFloat(vals[0]);
                            var y = parseFloat(vals[1]);
                            this.setScale(end, t, x, y);
                            break;
                        case "translateX":
                            var val = parseFloat(transform[trans]);
                            this.setTranslate(end, t, val, null);
                            break;
                        case "translateY":
                            var val = parseFloat(transform[trans]);
                            this.setTranslate(end, t, null, val);
                            break;
                        case "translate":
                            var vals = transform[trans].split(",");
                            var x = parseFloat(vals[0]);
                            var y = parseFloat(vals[1]);
                            this.setTranslate(end, t, x, y);
                            break;
                        default:
                            break;
                    }
                } catch (err) {

                }
            }
            this.rEndValues.value = end;
            this.rEndTransition.value = t.propToTransition;
        });
    }

    get style(){
        return this.rStyle.value;
    }

    set style(s: any){
        if (this.lastProc){
            this.lastProc.cancel();
        }
        this.rStyle.value = s;
        this.recalculate();
    }

    public setScale(obj: any, trans: any, x: number, y: number){
        var t = trans.get("transform");
        if (x !== null){
            obj.scaleX = this._getEndValue(t, x);
        }
        if (y !== null){
            obj.scaleY = this._getEndValue(t, y);
        }
    }

    public setTranslate(obj: any, trans: any,  x: number, y: number){
        var t = trans.get("transform");
        if (x !== null) {
            obj.translateX = this._getEndValue(t, x);
        }
        if (y !== null){
            obj.translateY = this._getEndValue(t, y);
        }
    }

    private _getEndValue(transform: Transition, value: any): ITransitionInfo{
        if (transform){
            return {
                type: 2,
                transition: transform,
                value: value
            }
        }
        else
        {
            return {
                type: 1,
                value: value
            }
        }
    }

    get endValues(){
        return this.rEndValues.value;
    }

    set endValues(v){
        this.rEndValues.value = v;
    }

    get endTransition(){
        return this.rEndTransition.value;
    }
}

function dummy(){

}

var animationDefaults = {
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0
}
