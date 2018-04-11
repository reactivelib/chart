import {ILabelStyle} from "../render/canvas/label/cache/index";
import {ITextLabelSettings} from "./text/index";
import {IComponentConfig} from "../../component/layout/axis/index";
import {
    IRelativePosComponentFactory,
    RelativePositionedComponentProxy
} from "../../component/layout/axis/component/factory";
import {IRelativePositionedGridElement} from "../../component/layout/axis/positioning/relative/index";
import {svgComponentLabel} from "../render/html/svg/component";
import {extend} from "@reactivelib/core";
import {html} from "@reactivelib/html";
import {IGlobalChartSettings} from "../style";
import {create, deps, inject} from "../../config/di";
import {INamedRelativePosComponentFactory} from "./index";

/**
 * A component that draws a label.
 * @editor
 */
export interface ILabelComponentConfig extends IComponentConfig, ITextLabelSettings{
    type: "label";
}

export class LabelComponentFactory implements INamedRelativePosComponentFactory
{

    name = "label"

    @inject
    theme: IGlobalChartSettings

    @create(function(this: LabelComponentFactory){
        return this.theme.font || {}
    })
    public fontStyle: ILabelStyle

    constructor(){

    }

    create(settings: IRelativePositionedGridElement): IRelativePositionedGridElement{
        var comp = <ILabelComponentConfig> settings.component;
        var style: any = extend({}, this.fontStyle, comp.style);
        var svgl = svgComponentLabel(style, this.getText(settings));
        var res = new RelativePositionedComponentProxy(settings, svgl);
        Object.defineProperty(res, "isSvg",{
            value: true
        });
        return res;
    }

    public getText(settings: IRelativePositionedGridElement): html.IHtmlShapeTypes{
        var comp = <ILabelComponentConfig> settings.component;
        var txt = comp.text || "No label";
        return <html.IHtmlShapeTypes>txt;
    }

}