/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import color, {IColor} from "../../../color/index";
import {copyObjectProperties} from "../../../config/object";
import unique from "../../../color/generator";
import {ICanvasStyle} from "../canvas/style/index";


/**
 * @editor
 */
export interface IColorStyleSettings{

    /**
     * @editor {type: "color"}
     */
    color?: string | IColor;
    style?: ICanvasStyle | ((color: IColor) => ICanvasStyle);

}

export interface IStyleAndColor{
    color: IColor;
    style: ICanvasStyle;
}

class ColorStyleProvider{

    public provideColor: () => IColor;
    public provideStyle: (color: IColor) => any;

    public createStyle(settings: IColorStyleSettings): IStyleAndColor{
        var col: IColor;
        if ("color" in settings){
            col = color(settings.color);
        }
        else {
            col = this.provideColor();
        }
        var style: any;
        if ("style" in settings){
            if (typeof settings.style === "function"){
                style = settings.style(col);
            }
            else
            {
                style = this.provideStyle(col);
                copyObjectProperties(settings.style, style);
            }
        }
        else {
            style = this.provideStyle(col);
        }
        return {style: style, color: col};
    }

}

export interface IStyleProviderSettings{
    provideColor?: () => IColor;
    providerStyle: (color: IColor) => any;
}

function createDefaultColorProvider(){
    var colorGenerator = unique();
    return function(){
        return color(colorGenerator.next());
    }
}

export function createColorStyleProvider(settings: IStyleProviderSettings): (style: IColorStyleSettings) => IStyleAndColor{
    var provider = new ColorStyleProvider();
    provider.provideColor = settings.provideColor || createDefaultColorProvider();
    provider.provideStyle = settings.providerStyle;
    return function(s: IColorStyleSettings){
        return provider.createStyle(s);
    }
}

export function provideLineStyle(color: IColor){
    return {
        strokeStyle: color.toString(),
        lineWidth: 2
    }
}