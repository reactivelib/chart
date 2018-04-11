/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ISeriesRendererSettings} from "../../cartesian/series/render";

export type RendererSetting = string | ISeriesRendererSettings;

function normalizeRendererSetting(s: RendererSetting | RendererSetting[]): RendererSetting[]{
    if (Array.isArray(s)){
        return s;
    }
    return [s];
}

export function seriesToRendererSettings(renderers: RendererSetting | RendererSetting[]): ISeriesRendererSettings[]{
    var res: ISeriesRendererSettings[] = [];
    return normalizeRendererSetting(renderers).map(r => {
        var rr: ISeriesRendererSettings;
        if (typeof r === "string"){
            rr = <any>{type: r};
        }
        else {
            rr = <any>r;
        }
        return rr;
    });
}