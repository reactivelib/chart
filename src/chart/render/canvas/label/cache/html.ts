import {ILabelStyle, LabelType} from "./index";
import {html} from "@reactivelib/html";
import {removeNullOrUndefinedFromObject} from "../../../../../config/object";
import {IRectangleCanvasShape} from "../../shape/rectangle/index";
import {SettingsHTMLSurface} from "../../shape/html/index";
import {extend} from "@reactivelib/core";
import {renderCanvas} from "../../shape/create";
import {variable} from "@reactivelib/reactive";

function getStyleForHtml(style: ILabelStyle){
    var res: html.ICSSStyle = {
        backgroundColor: style.background,
        color: style.fill,
        font: style.font,
        fontFamily: style.fontFamily,
        fontVariant: style.fontVariant,
        fontWeight: style.fontWeight,
        fontSize: style.fontSize,
        fontStyle: style.fontStyle
    };
    return removeNullOrUndefinedFromObject(res);
}

export class HtmlLabelProvider{

    getLabel(style: ILabelStyle, text: LabelType): IRectangleCanvasShape{
        if (typeof text === "string"){
            var st = getStyleForHtml(style);
            var res = new SettingsHTMLSurface(variable.transformProperties({
                x: 0,
                y: 0,
                html: {
                    tag: "span",
                    style: extend({whiteSpace: "nowrap"}, st),
                    child: text
                },
                get rotate(){
                    return style.rotate
                }
            }, ["x" ,"y"]));
            return res;
        }
        else {
            return <IRectangleCanvasShape>renderCanvas(text);
        }
    }
}
