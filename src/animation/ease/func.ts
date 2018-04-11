export interface IEaser{
    (time: number, startVal: number, changeVal: number, duration: number): number;
}

export function linearEase(time: number, startVal: number, changeVal: number, duration: number){
    return changeVal * (time / duration) + startVal;
}

function easeOutQuad(t: number, b: number, c: number, d: number){
    t /= d;
    return -c * t*(t-2) + b;
};

function easeOutBounce(t: number, b: number, c: number, d: number){
    if ((t/=d) < (1/2.75)) {
        return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
}

export type EasingType = "linear" | "outQuad" | "outBounce";

var nameToEasing = {
    linear: linearEase,
    outQuad: easeOutQuad,
    outBounce: easeOutBounce
}

export function getEaserByName(name: string): IEaser{
    return (<any>nameToEasing)[name];
}

export function normalizeEaser(name: string | IEaser){
    if (typeof name === "string"){
        return getEaserByName(name);
    }
    return name;
}