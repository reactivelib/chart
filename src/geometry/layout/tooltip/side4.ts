/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {default as rectangle, IDimension, IRectangle} from "../../rectangle/index";
import {IPoint} from "../../point/index";
import {IIterator} from "../../../collection/iterator/index";

export type ARROW_SIDE = "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "MIDDLE";

export interface IArrowPosition{
    first: ARROW_SIDE;
    second: ARROW_SIDE;
}

function mirrorSide(side: ARROW_SIDE){
    var r: ARROW_SIDE;
    switch(side){
        case "LEFT":
            r = "RIGHT";
            break;
        case "RIGHT":
            r = "LEFT";
            break;
        case "BOTTOM":
            r = "TOP";
            break;
        case "TOP":
            r = "BOTTOM";
            break;
        default:
            r = side;
    }
    return r;
}

function mirrorArrowPosition(pos: IArrowPosition): IArrowPosition{
    return {
        first: mirrorSide(pos.first),
        second: mirrorSide(pos.second)
    }
}

function arrangeX(pos: IPoint, dim: IDimension, side: ARROW_SIDE): number{
    switch(side){
        case "RIGHT":
            return pos.x - dim.width;
        case "LEFT":
            return pos.x;
        case "MIDDLE":
            return pos.x - (dim.width / 2);
    }
}

function arrangeY(pos: IPoint, dim: IDimension, side: ARROW_SIDE): number{
    switch(side){
        case "BOTTOM":
            return pos.y - dim.height;
        case "TOP":
            return pos.y;
        case "MIDDLE":
            return pos.y - (dim.height / 2);
    }
}

export function topLeftPosition(pos: IPoint, box: IDimension, arrow: IArrowPosition): IPoint{
    var x: number;
    var y: number;
    switch(arrow.first){
        case "RIGHT":
            x = pos.x - box.width;
            y = arrangeY(pos, box, arrow.second);
            break;
        case "LEFT":
            x = pos.x;
            y = arrangeY(pos, box, arrow.second);
            break;
        case "TOP":
            y = pos.y;
            x = arrangeX(pos, box, arrow.second);
            break;
        case "BOTTOM":
            y = pos.y - box.height;
            x = arrangeX(pos, box, arrow.second);
            break;
    }
    return {
        x: x, y: y
    };
}

function insideHorizontal(sx: number, ex: number, box: IRectangle){
    var bex = box.x + box.width;
    return sx >= box.x && ex <= bex;
}

function insideVertical(sy: number, ey: number, box: IRectangle){
    var bey = box.y + box.height;
    return sy >= box.y && ey <= bey;
}

function inside(xy: IPoint, settings: ISide4TooltipLayoutSettings){
    return insideHorizontal(xy.x, xy.x + settings.tooltip.width, settings.container)
    && insideVertical(xy.y, xy.y + settings.tooltip.height, settings.container)
}

export interface ITooltipLayoutSettings{
    tooltip: IDimension;
    container: IRectangle;
}

export interface ILayoutTarget{
    arrow: IArrowPosition;
    position: IPoint;
}

export interface IPositionedLayoutTarget extends ILayoutTarget{
    topLeft: IPoint;
}

export interface ISide4TooltipLayoutSettings extends ITooltipLayoutSettings{

    targets: IIterator<ILayoutTarget>;
    inside?: (pt: IPoint, settings: ISide4TooltipLayoutSettings) => boolean;

}

export function layoutTooltip(settings: ISide4TooltipLayoutSettings): IPositionedLayoutTarget{
    var p = settings.targets;
    var isIn = settings.inside || inside;
    var first: ILayoutTarget;
    while(p.hasNext()){
        var pos = p.next();
        if (!first){
            first = pos;
        }
        var xy = topLeftPosition(pos.position, settings.tooltip, pos.arrow);
        if (isIn(xy, settings)){
            return {
                arrow: pos.arrow,
                position: pos.position,
                topLeft: xy
            };
        }
    }
    pos = first;
    xy = topLeftPosition(pos.position, settings.tooltip, pos.arrow);
    return {
        arrow: pos.arrow,
        position: pos.position,
        topLeft: xy
    };
}

export interface ITooltipAndTarget{
    tooltip: IDimension;
    targets: IIterator<ILayoutTarget>;
}

export interface ITooltipGroup4SideLayoutSettings{

    tooltips: IIterator<ITooltipAndTarget>;
    container: IRectangle;

}

function isOverlapping(rect: IRectangle, rects: IRectangle[]){
    for (var i=0; i < rects.length; i++){
        if (rectangle(rect).isOverlappingWith(rects[i])){
            return true;
        }
    }
    return false;
}

export function layoutGroupTooltip(settings: ITooltipGroup4SideLayoutSettings): IPositionedLayoutTarget[]{
    var rects: IRectangle[] = [];
    var poses: IPositionedLayoutTarget[] = [];
    function isInside(pt: IPoint, s: ISide4TooltipLayoutSettings){
        return inside(pt, s) && !isOverlapping({x: pt.x, y: pt.y, width: s.tooltip.width, height: s.tooltip.height}, rects);
    }
    var ttIt = settings.tooltips;
    while(ttIt.hasNext()){
        var tt = ttIt.next();
        var targ = tt.targets;
        var toolt = tt.tooltip;
        var pos = layoutTooltip({
            tooltip: toolt, inside: isInside, targets: targ, container: settings.container
        });
        poses.push(pos);
        var pt = pos.topLeft;
        rects.push({x: pt.x, y: pt.y, width: toolt.width, height: toolt.height})
    }
    return poses;
}