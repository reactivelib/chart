import {popStyle, pushStyle} from "../../style/index";
import {IColorScale} from "./index";
import {applyNone, CanvasContext} from "../../context/index";
import {IColorable} from "../../../../../datatypes/color";

export function applyColorScale(data: IColorable, cs: IColorScale, ctx: CanvasContext){
    var color = cs.getColor(data.c);
    var s: any = {};
    if (ctx.style.applyFill !== applyNone){
        s.fillStyle = color;
    }
    if (ctx.style.applyStroke !== applyNone){
        s.strokeStyle = color;
    }
    return pushStyle(ctx.context, s);
}

export function unapplyColorScale(old: any, ctx: CanvasContext){
    popStyle(ctx.context, old);
}