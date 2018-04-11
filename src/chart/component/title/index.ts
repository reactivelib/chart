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
export interface ITitleComponentConfig extends IComponentConfig{

    type: "title";
    /**
     * The style of the text
     */
    style?: ILabelStyle;
}


export class TitleComponentFactory extends LabelComponentFactory
{

    name = "title"

    @inject
    public chartSettings: IChartSettings

    @create(function(this: LabelComponentFactory){
        return (this.theme.title && this.theme.title.style) || {}
    })
    public fontStyle: ILabelStyle

    public getText(settings: IRelativePositionedGridElement): html.IHtmlShapeTypes{
        return <html.IHtmlShapeTypes>this.chartSettings.title || "No Title";
    }


}