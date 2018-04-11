import {RectangleSide} from "../incremental/side";
import {IPoint} from "../../../point/index";

function yPoint(pt: IPoint){
    return pt.y;
}

function xPoint(pt: IPoint){
    return pt.x;
}

export function getYCoordinatePointPositionProvider(side: RectangleSide): (pt: IPoint) => number{
    switch(<string>side){
        case "bottom":
        case "top":
        case "inner-bottom":
        case "inner-top":
            return xPoint;
        case "left":
        case "right":
        case "inner-left":
        case "inner-right":
            return yPoint;
    }
    throw new Error("Unknown side "+side);
}
