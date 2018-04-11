/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IRectangle} from "../../../geometry/rectangle/index";
import {ISeries} from "../index";
import {IShapeWithData} from "../../render/canvas/series/data/index";
import {IHighlightable} from "../../render/style/highlight";
import {IStyleAndColor} from "../../render/style/stylable";
import {ICancellable} from "@reactivelib/reactive/src/cancellable";
import {color as createColor, IColor} from "../../../color";
import {create, define, inject} from "../../../config/di";
import {ICanvasStyle} from "../../render/canvas/style";
import {variable, procedure} from "@reactivelib/reactive";
import {ICartesianSeriesSettings} from "../../cartesian/series/series";
import {ISeriesRendererSettings} from "../../cartesian/series/render";
import {extend} from '@reactivelib/core';

export interface ISeriesShape extends IShapeWithData<any>{

    getScreenBoundingBox(): IRectangle;
    series: ISeries;

}

function getStyleFromSetting(oldStyle: ICanvasStyle, style: ICanvasStyle | ((color: IColor) => ICanvasStyle), color: variable.IVariable<IColor>): ICanvasStyle{
    if (typeof style === "function"){
        return extend(oldStyle, style(color.value));
    }
    return extend(oldStyle, style);
}

export interface ISeriesRenderer extends IHighlightable, IStyleAndColor{

    findShapesByIndex(data: any): ISeriesShape[];
    cancel(): void;

}

export abstract class SeriesRenderer implements ISeriesRenderer{

    @define
    cancels: ICancellable[] = [];


    @inject
    seriesSettings: ICartesianSeriesSettings
    @inject
    globalSeriesSettings: ICartesianSeriesSettings
    @inject
    series: ISeries

    @create
    public r_color: variable.IVariable<IColor>;

    @define
    public settings: ISeriesRendererSettings;

    constructor(settings: ISeriesRendererSettings){
        this.settings = settings;
    }


    get color(){
        return this.r_color.value;
    }

    set color(v){
        this.r_color.value = v;
    }

    create_r_color(){
        var vari = variable(null).listener(v => {
            if (this.settings.color){
                v.value = createColor(this.settings.color);
            }
            else{
                v.value = this.series.color;
            }
        });
        this.cancels.push(vari.$r);
        return vari;
    }

    @create
    public r_style = variable<ICanvasStyle>(null);

    get style(){
        return this.r_style.value;
    }

    set style(v){
        this.r_style.value = v;
    }

    create_r_style(){
        var vari = variable<ICanvasStyle>(null);
        var proc = procedure(p => {
            var v = vari;
            const style = this.provideStyle(this.color);
            if (this.settings.style){
                v.value = getStyleFromSetting(style, this.settings.style, this.r_color);
            }
            else if (this.seriesSettings.style){
                v.value = getStyleFromSetting(style, this.seriesSettings.style, this.r_color);
            }
            else if (this.globalSeriesSettings.style){
                v.value = getStyleFromSetting(style, this.globalSeriesSettings.style, this.r_color);
            }
            else{
                v.value = this.provideStyle(this.color);
            }
        });
        this.cancels.push(proc);
        return vari;
    }


    abstract findShapesByIndex(data: any): ISeriesShape[];
    abstract highlight(): ICancellable;

    provideStyle(color: IColor): any{
        var s = color.toString();
        return {
            fillStyle: s
        }
    }

    cancel(): void{
        this.cancels.forEach(c => c.cancel());
    }

}