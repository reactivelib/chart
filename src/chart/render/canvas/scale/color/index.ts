/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array} from "@reactivelib/reactive";
import {createDiscreteColorScale} from "./discrete";
import {findInIterator} from "../../../../../collection/iterator/index";

export interface IColorScale{

    getColor(val: any): string;
    id: string;

}

/**
 * @editor
 */
export interface IValueAndColor{
    value: number;
    include?: boolean;
    color: string;
}

/**
 * @editor
 */
export interface IColorScaleSettings{
    id: string;
    type: "discrete" | "gradient" | "direct";
    colors?: IValueAndColor[];
}

class DirectColorSale implements IColorScale{
    getColor(val: any): string{
        return val;
    }
    public id: string;
}

export class ColorScaleCollection{

    public collection = array<IColorScale>();

    public add(settings: IColorScaleSettings): IColorScale{
        var scale: IColorScale;
        switch(settings.type){
            case "discrete":
                scale = createDiscreteColorScale(settings);
                this.collection.push(scale);
                break;
            case "direct":
                scale = new DirectColorSale();
                this.collection.push(scale);
                break;
            case "gradient":
            default:
                throw new Error("Unknown color scale type "+settings.type);
        }
        scale.id = settings.id;
        return scale;
    }

    public get(id: string){
        return findInIterator(this.collection.iterator(), scale => scale.id === id);
    }

}