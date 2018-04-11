import {IOptional, optional} from "@reactivelib/core";
import {log10} from "../log";
import {IValueTransformer} from "./interval";

export class Log10Transformer implements IValueTransformer{
    
    constructor(public transformer: IValueTransformer){
        
    }

    transform(x: number){
        return this.transformer.transform(log10(x));
    }
    
    inverse(): IOptional<IValueTransformer>{
        var m = this.transformer.inverse();
        if (m.present){
            return optional(new Log10InverseTransformer(m.value));
        }
        return optional();
    }
    
    copy(): IValueTransformer{
        return new Log10Transformer(this.transformer.copy());
    }
    
    isEqual(t: Log10Transformer){
        return t.transformer && t.transformer.isEqual(this.transformer);
    }
    
}

export class Log10InverseTransformer implements IValueTransformer{

    constructor(public transformer: IValueTransformer){

    }

    transform(x: number){
        var p = this.transformer.transform(x);
        p = Math.pow( 10, p);
        return p;
    }

    inverse(): IOptional<IValueTransformer>{
        var m = this.transformer.inverse();
        if (m.present){
            return optional(new Log10Transformer(m.value));
        }
        return optional();
    }

    copy(): IValueTransformer{
        return new Log10InverseTransformer(this.transformer.copy());
    }

    isEqual(t: Log10InverseTransformer){
        return t.transformer && t.transformer.isEqual(this.transformer);
    }
    
}