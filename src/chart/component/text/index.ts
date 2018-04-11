/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPaddingSettings} from "../../../geometry/rectangle/index";
import {ILabelStyle, LabelType} from "../../render/canvas/label/cache/index";

/**
 * Configuration of a text label
 * @editor
 */
export interface ITextLabelSettings{
    /**
     * The text to display
     */
    text?: LabelType;
    /**
     * Padding around the text
     */
    space?: IPaddingSettings | number;
    /**
     * The style of the text
     */
    style?: ILabelStyle;
}

export function normalizeSettings(settings: ITextLabelSettings | string): ITextLabelSettings{
    if (!settings){
        return {
            text: null
        }
    }
    if (typeof settings === "string"){
        return {
            text: <string>settings
        }
    }
    return <ITextLabelSettings>settings;
}