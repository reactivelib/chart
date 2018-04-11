import {HeightInterval, IRectangle, WidthInterval} from "../../../rectangle/index";
import {IInterval} from "../../../interval/index";
import {ComponentPosition, IGridPosition} from "../../../../component/layout/axis/positioning/relative";

export type RectangleSide = "left" | "right" | "top" | "bottom" | "inner-left" | "inner-right" | "inner-bottom" | "inner-top";

function xInterval(r: IRectangle){
    return new WidthInterval(r);
}

function yInterval(r: IRectangle){
    return new HeightInterval(r);
}

var sideToIntervalProvider = {
    left: yInterval,
    "inner-left": yInterval,
    right: yInterval,
    "inner-right": yInterval,
    bottom: xInterval,
    "inner-bottom": xInterval,
    top: xInterval,
    "inner-top": xInterval
}

var osideToIntervalProvider = {
    left: xInterval,
    "inner-left": xInterval,
    right: xInterval,
    "inner-right": xInterval,
    bottom: yInterval,
    "inner-bottom": yInterval,
    top: yInterval,
    "inner-top": yInterval
}

export function getRectangleSide(pos: ComponentPosition | IGridPosition): RectangleSide{
    if (typeof pos === "string"){
        return pos;
    }
    var surf = pos.surface || "outer";
    if (surf === "outer"){
        if (pos.x === 0){
            if (pos.y < 0){
                return "top";
            }
            else
            {
                return "bottom";
            }
        }
        else
        {
            if (pos.x < 0){
                return "left";
            }
            else
            {
                return "right";
            }
        }
    }
    else
    {
        if (pos.x === 0){
            if (pos.y < 0){
                return "inner-top";
            }
            else
            {
                return "inner-bottom";
            }
        }
        else
        {
            if (pos.x < 0){
                return "inner-left";
            }
            else
            {
                return "inner-right";
            }
        }
    }
}

export function getRectangleSideIntervalProvider(side: RectangleSide): (r: IRectangle) => IInterval{
    return sideToIntervalProvider[side];
}

export function getRectangleOppositeSideIntervalProvider(side: RectangleSide): (r: IRectangle) => IInterval{
    return osideToIntervalProvider[side];
}