import {IOptional, optional} from "@reactivelib/core";
import {IInterval, IPointInterval} from "../../geometry/interval/index";

export interface IValueTransformer{
    transform(x: number): number;
    inverse(): IOptional<IValueTransformer>;
    copy(): IValueTransformer;
    isEqual(t: IValueTransformer): boolean;
}

class NullValueTransformer implements IValueTransformer{

    transform(x: number): number{
        return x;
    }
    inverse(): IOptional<IValueTransformer>{
        return optional(nullValueTransformer); 
    }
    copy(): IValueTransformer{
        return nullValueTransformer;
    }
    public isEqual(t: IValueTransformer): boolean{
        return t === this;
    }
    
}

export var nullValueTransformer = new NullValueTransformer();

class LinearValueTransformer implements IValueTransformer{
    
    constructor(public offset: number, public ratio: number){
        
    }
    
    transform(x: number){
        return this.offset + this.ratio*x;
    }
    
    inverse(): IOptional<IValueTransformer>{
        if (this.ratio === 0){
            return optional();
        }
        return optional(new LinearValueTransformer(-(this.offset/this.ratio), 1/this.ratio));
    }
    
    copy(){
        return new LinearValueTransformer(this.offset, this.ratio);
    }
    
    isEqual(v: LinearValueTransformer){
        return v.offset === this.offset && v.ratio === this.ratio;
    }
    
    
}

export function linearTransformer(source: IPointInterval, target: IPointInterval){
    if (source.end === source.start){
        offset = 1;
        ratio = 1;
    }
    else{
        var offset = ((source.end * target.start) - (target.end *source.start)) / (source.end - source.start);
        var ratio = (target.end - target.start) / (source.end - source.start);
    }
    return new LinearValueTransformer(offset, ratio);
}