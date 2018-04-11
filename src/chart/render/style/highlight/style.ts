import {IColor} from "../../../../color";

export function getAreaHighlightStyleForColor(color: IColor){
    var hs: any = {
        lineWidth: 4,
        zIndex: 1000
    }
    var col = color.toHSL();
    col.l = Math.max(0, col.l - 0.1);
    hs.strokeStyle = col.toRGB().toString();
    return hs;
}

export function getLineHighlightStyleForColor(color: IColor){
    var hs: any = {
        lineWidth: 4,
        zIndex: 1000
    }
    hs.strokeStyle = color.toString();
    return hs;
}