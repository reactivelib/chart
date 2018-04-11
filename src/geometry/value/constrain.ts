/**
 * Min and max settings of a value
 */
export interface IValueConstraintsSettings{
    /**
     * Min value
     */
    min?: number;
    /**
     * Max value
     */
    max?: number;
}

export function normalizeValueModifySettings(minMax: IValueConstraintsSettings): IValueConstraintsSettings{
    if (!minMax){
        return {
            min: -Number.MAX_VALUE,
            max: Number.MAX_VALUE
        }
    }
    var res: IValueConstraintsSettings = {
        min: -Number.MAX_VALUE,
        max: Number.MAX_VALUE
    };
    if ("min" in minMax){
        Object.defineProperty(res, "min", Object.getOwnPropertyDescriptor(minMax, "min"));
    }
    if ("max" in minMax){
        Object.defineProperty(res, "max", Object.getOwnPropertyDescriptor(minMax, "max"));
    }
    return res;
}

export function createValueConstrainer(settings: IValueConstraintsSettings){
    var norm = normalizeValueModifySettings(settings);
    return function(x: number){
        return Math.min(norm.max, Math.max(norm.min, x));
    }
}