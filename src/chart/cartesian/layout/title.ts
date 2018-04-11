/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IChartSettings} from "../../core/basic";
import {IGlobalChartSettings} from "../../style";
import {extend} from "@reactivelib/core";
import {ITextLabelSettings} from "../../component/text/index";
import {IPaddingSettings, normalizePaddingSettings} from "../../../geometry/rectangle/index";
import {ILabelComponentConfig} from "../../component/label";
import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative";

function normalizeTitle(title: string | ITextLabelSettings): ITextLabelSettings{
    if (typeof title === "string"){
        return {
            text: title
        }
    }
    return title;
}

function normalizeSpace(theme: number | IPaddingSettings, current: number | IPaddingSettings){
    if (current){
        return normalizePaddingSettings(current);
    }
    return normalizePaddingSettings(theme);
}

export function titleLayout(settings: IChartSettings, theme: IGlobalChartSettings): IRelativePositionedGridElement[]{
    var res: IRelativePositionedGridElement[] = [];
    if (settings.subtitle){
        var st = theme.subtitle || {};
        var title = normalizeTitle(settings.subtitle);
        var style = extend({}, st.style, title, title.style);
        var space = normalizeSpace(st.space, title.space);
        res.push({
            component: <ILabelComponentConfig>{
                type: "label",
                text: title.text,
                style: style
            },
            position: "top",
            halign: "middle"
        });
    }
    if (settings.title){
        var st = theme.title || {};
        var title = normalizeTitle(settings.title);
        var style = extend({}, st.style, title, title.style);
        var space = normalizeSpace(st.space, title.space);
        res.push({
            position: "top",
            halign: "middle",
            component: <ILabelComponentConfig>{
                type: "label",
                style: style,
                text: title.text
            }
        });
    }
    return res;
}