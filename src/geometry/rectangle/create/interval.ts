import {IInterval} from "../../interval";

export interface IntervalConfig{
    horizontal: IInterval,
    vertical: IInterval
}

export class IntervalBacked{

    constructor(public widthInterval: IInterval, public heightInterval: IInterval){

    }

    get x(){
        return this.widthInterval.start;
    }

    set x(v){
        this.widthInterval.start = v;
    }

    get y(){
        return this.heightInterval.start;
    }

    set y(v){
        this.heightInterval.start = v;
    }

    get width(){
        return this.widthInterval.size;
    }

    set width(v){
        this.widthInterval.size = v;
    }

    get height(){
        return this.heightInterval.size;
    }

    set height(v){
        this.heightInterval.size = v;
    }

};

export default function interval(interval: IntervalConfig){
    return new IntervalBacked(interval.horizontal, interval.vertical);
}