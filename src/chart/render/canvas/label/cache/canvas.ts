import {ICanvasStyle} from "../../style/index";
import {ILabelStyle, LabelType} from "./index";
import {removeNullOrUndefinedFromObject} from "../../../../../config/object";
import {IRectangleCanvasShape} from "../../shape/rectangle/index";
import {LabelShape} from "../../shape/label/index";
import {renderCanvas} from "../../shape/create";

var canvasToStyle = {
    stroke: "strokeStyle",
    fillStyle: "fillStyle"
}

function getStyleForCanvas(style: ILabelStyle){
    var cs: ICanvasStyle = {};
    if (style.fontFamily && style.fontSize){
        cs.font = (style.fontStyle || "")+" "+(style.fontVariant || "")+" "+(style.fontWeight || "")+" "+(style.fontSize)+" "+style.fontFamily;
    }
    else if (style.font){
        cs.font = style.font;
    }
    if ("stroke" in style){
        cs.strokeStyle = style.stroke;
    }
    if ("fill" in style){
        cs.fillStyle = style.fill;
    }
    return removeNullOrUndefinedFromObject(cs);
}

export class CanvasLabelProvider{
    getLabel(style: ILabelStyle, text: LabelType): IRectangleCanvasShape{
        if (typeof text === "string"){
            var cs = getStyleForCanvas(style);
            return new LabelShape({
                tag: "label",
                style: cs,
                text: text,
                backgroundStyle: style.background,
                rotate: style.rotate
            });
        }
        else {
            return <IRectangleCanvasShape>renderCanvas(text);
        }
    }
}
