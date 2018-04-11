import {ILabelStyle, LabelType} from "./index";
import {html} from "@reactivelib/html";
import {removeNullOrUndefinedFromObject} from "../../../../../config/object";
import {IRectangleCanvasShape} from "../../shape/rectangle/index";
import {SVGSurface} from "../../shape/svg";
import {renderCanvas} from "../../shape/create";

var svgStyleAttributes = {
    fontFamily: "font-family",
    font: "font",
    fontSize: "font-size",
    fontStyle: "font-style",
    fontWeight: "font-weight",
    strokeStyle: "stroke",
    fillStyle: "fill",
    stroke: "stroke",
    fill: "fill"
}

export function getStyleForSvg(style: ILabelStyle){
    var res: html.ICSSStyle = {
        fill: style.fill,
        stroke: style.stroke,
        font: style.font,
        "font-family": style.fontFamily,
        "font-variant": style.fontVariant,
        "font-weight": style.fontWeight,
        "font-size": style.fontSize,
        "font-style": style.fontStyle
    };
    return removeNullOrUndefinedFromObject(res);
}

export class SvgLabelProvider{
    getLabel(style: ILabelStyle, text: LabelType): IRectangleCanvasShape{
        if (typeof text === "string"){
            var res = new SVGSurface();
            res.x = 0;
            res.y = 0;
            var attributes: any = getStyleForSvg(style);
            var st: any = {};
            if (style.rotate){
                res.rotate = style.rotate;
            }
            res.svg = {
                tag: "text",
                attr: attributes,
                style: st,
                child: text
            }
            if (style.background){
                res.background = style.background;
            }
            return res;
        }
        else {
            return <IRectangleCanvasShape>renderCanvas(text);
        }
    }
}