export function removeProperties(object: any, properties: string[]){
    properties.forEach(p => delete object[p]);
    return object;
}

export function joinObjects(...objects: any[]){
    var res: any = {};
    objects.forEach(o => {
        for (var p in o){
            res[p] = o[p];
        }
    });
    return res;
}