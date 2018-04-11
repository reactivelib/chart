/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {ILabelStyle} from "../../render/canvas/label/cache/index";
import {IComponentConfig} from "../../../component/layout/axis/index";
import {IRelativePositionedGridElement} from "../../../component/layout/axis/positioning/relative/index";
import {html} from "@reactivelib/html";
import {create, inject} from "../../../config/di";
import {LabelComponentFactory} from "../label";
import {IChartSettings} from "../../core/basic";

/**
 * A component that draws a label.
 * @editor
 */
export interface SubtitleITitleComponentConfig extends IComponentConfig{

    type: "subtitle";
    /**
     * The style of the text
     */
    style?: ILabelStyle;
}


export class SubtitleComponentFactory extends LabelComponentFactory
{

    name = "subtitle"

    @inject
    public chartSettings: IChartSettings

    @create(function(this: LabelComponentFactory){
        return (this.theme.subtitle && this.theme.subtitle.style) || {}
    })
    public fontStyle: ILabelStyle

    public getText(settings: IRelativePositionedGridElement): html.IHtmlShapeTypes{
        return <html.IHtmlShapeTypes>this.chartSettings.subtitle || "No Subitle";
    }


}