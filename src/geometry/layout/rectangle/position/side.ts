import {centerHorizontal, centerVertical, right, top} from "../../align";
import {IPositionedRectangle} from "./index";
import {RectangleSide} from "../incremental/side";

export function layoutLeft(label: IPositionedRectangle){
    right(0, label);
    centerVertical(label.position, label);
}

export function layoutRight(label: IPositionedRectangle){
    label.x = 0;
    centerVertical(label.position, label);
}

export function layoutBottom(label: IPositionedRectangle){
    top(0, label);
    centerHorizontal(label.position, label);
}

export function layoutTop(label: IPositionedRectangle){
    label.y = 0;
    centerHorizontal(label.position, label);
}

var sideToLayouter = {
    left: layoutLeft,
    "inner-left": layoutLeft,
    right: layoutRight,
    "inner-right": layoutRight,
    bottom: layoutBottom,
    "inner-bottom": layoutBottom,
    top: layoutTop,
    "inner-top": layoutTop
}

export function layoutBySide(side: RectangleSide){
    return sideToLayouter[side];
}