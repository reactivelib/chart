/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ICancellable} from "@reactivelib/reactive";
import {IColor} from "../../color/index";
import {MultiStarter} from "../../config/start";
import {ISeriesRenderer} from "./render/base";
import {IColorStyleSettings} from "../render/style/stylable";
import {IHighlightable} from "../render/style/highlight";
import {variable} from "@reactivelib/reactive";
import {component, create, define, inject} from "../../config/di";
import {color} from "../../color";
import {CoreChart} from "../core/basic";
import {ISeriesGroup} from "../cartesian/series/group";


/**
 * Options for a series.
 * @editor
 */
export interface ISeriesSettings extends IColorStyleSettings{
    /**
     * The data
     */
    data?: any;
    /**
     * The id of the series. If no id is specified, the series will get an automatically generated one.
     */
    id?: string;
    /**
     * see @link(ISeries.label)
     */
    label?: string;
}

/**
 * A series visualizes a set of data.
 */
export interface ISeries{

    /**
     * id of the series
     */
    id: string;
    /**
     * Color of the series. Data will be generally visualized using this color.
     */
    color: IColor;
    /**
     * The data collection to visualize. The type of the collection depends on the concrete series
     */
    data: any;
    /**
     * An optional label that is used by other components, like legend or tooltips. If not specified, the "id" will be
     * generally used.
     */
    label: string;

}

@component("series")
export class AbstractSeries implements ISeries{

    @create
    public defaultId: string;
    create_defaultId(){
        return this.provideSeriesId()
    }

    public data: any;

    @define
    public settings: ISeriesSettings;
    @define
    public globalSettings: ISeriesSettings
    @define
    public cancels: ICancellable[] = [];
    @define
    starter = new MultiStarter()

    public cancel(){
        this.cancels.forEach(c => c.cancel());
    }

    public renderer: ISeriesRenderer;

    @inject
    provideColor: () => IColor

    @inject
    provideSeriesId: () => string

    get id(){
        return this.settings.id || this.defaultId;
    }

    get label(){
        return this.settings.label || this.id;
    }

    @create
    public r_color: variable.IVariable<IColor>;

    get color(){
        return this.r_color.value;
    }

    set color(v){
        this.r_color.value = v;
    }

    create_r_color(){
        var defaultColor = this.provideColor();
        var vari = variable(null).listener((v) => {
            var col = this.settings.color || this.globalSettings.color;
            if (col){
                v.value = color(col);
            }
            else {
                v.value = defaultColor;
            }
        });
        return vari;
    }

    @define
    public seriesSettings: ISeriesSettings

    @define
    globalSeriesSettings: ISeriesSettings

    constructor(settings: ISeriesSettings, globalSettings: ISeriesSettings){
        this.settings = settings;
        this.seriesSettings = settings;
        this.globalSettings = globalSettings;
        this.globalSeriesSettings = globalSettings;
    }

    public highlight(){
        var cancels: ICancellable[] = [];
        var c = this.renderer;
        if (c && "highlight" in c){
            cancels.push((<IHighlightable><any>c).highlight());
        }
        return {
            cancel: () => {
                cancels.forEach(c => c.cancel());
            }
        }
    }
}