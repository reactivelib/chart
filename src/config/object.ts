export function copyObjectProperties(source: any, target: any){
    if (source){
        for (var p in source){
            target[p] = source[p];
        }
    }
}

export function removeNullOrUndefinedFromObject(obj: any){
    var res: {[s: string]: any} = {};
    for (var k in obj){
        var v = obj[k];
        if (v !== null && v !== void 0){
            res[k] = v;
        }
    }
    return res;
}

export interface KeyValue{
    key: string;
    value: any;
}

export function objectToKeyValueArray(object: any): KeyValue[]{
    var vals = [];
    if (!object){
        return [];
    }
    for (var p in object){
        vals.push({key: p, value: object[p]});
    }
    return vals;
}

export function keyValueArrayToObject(kv: KeyValue[]){
    var obj:any = {};
    kv.forEach(k => {
        obj[k.key] = k.value;
    });
    return obj;
}