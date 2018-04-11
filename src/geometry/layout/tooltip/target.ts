/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IIterator} from "../../../collection/iterator/index";
import {IRectangle} from "../../rectangle/index";
import {IArrowPosition, ILayoutTarget} from "./side4";
import {IPoint} from "../../point/index";

export interface ITargetArrowPosition{

    target: IArrowPosition;
    arrow: IArrowPosition;

}

function yTopPos(target: IRectangle){
    return target.y;
}

function yMiddlePos(target: IRectangle){
    return target.y + target.height / 2;
}

function yBottomPos(target: IRectangle){
    return target.y + target.height;
}

var yPosProvider = {
    "TOP": yTopPos,
    "BOTTOM": yBottomPos,
    "MIDDLE": yMiddlePos
}

function xLeftPos(target: IRectangle){
    return target.x;
}

function xMiddlePos(target: IRectangle){
    return target.x + target.width / 2;
}

function xRightPos(target: IRectangle){
    return target.x + target.width;
}

var xPosProvider = {
    "LEFT": xLeftPos,
    "RIGHT": xRightPos,
    "MIDDLE": xMiddlePos
}

function leftSidePos(target: IRectangle, position: IArrowPosition): IPoint {
    return {x: target.x, y: (<any>yPosProvider)[position.second](target)};
}

function rightSidePos(target: IRectangle, position: IArrowPosition): IPoint{
    return {x: target.x + target.width, y: (<any>yPosProvider)[position.second](target)};
}

function bottomSidePos(target: IRectangle, position: IArrowPosition): IPoint{
    return {x: (<any>xPosProvider)[position.second](target), y: target.y + target.height};
}

function topSidePos(target: IRectangle, position: IArrowPosition): IPoint{
    return {x: (<any>xPosProvider)[position.second](target), y: target.y};
}

var firstToPositionProvider = {
    "LEFT": leftSidePos,
    "RIGHT": rightSidePos,
    "TOP": topSidePos,
    "BOTTOM": bottomSidePos
}

function getTargetPosition(target: IRectangle, position: IArrowPosition): IPoint{
    return (<any>firstToPositionProvider)[position.first](target, position);
}

class SideRectangleTargetPointsIterator implements IIterator<ILayoutTarget>{

    private index: number = 0;

    constructor(public target: IRectangle, public positions: ITargetArrowPosition[]){

    }

    public hasNext(){
        return this.index < this.positions.length;
    }

    public next(){
        var arrowTarget = this.positions[this.index];
        var pos = getTargetPosition(this.target, arrowTarget.target);
        this.index++;
        return {
            arrow: arrowTarget.arrow,
            position: pos
        };
    }

}

export function createRectanglePointsGenerator(positions: ITargetArrowPosition[]){
    return function(target: IRectangle): IIterator<ILayoutTarget>{
        return new SideRectangleTargetPointsIterator(target, positions);
    }
}

export function createDefaultRectanglePointsGenerator(){
    return createRectanglePointsGenerator([
    {target: {first: "LEFT", second: "MIDDLE"}, arrow: {first: "RIGHT", second: "MIDDLE"}},
    {target: {first: "RIGHT", second: "MIDDLE"}, arrow: {first: "LEFT", second: "MIDDLE"}},
    {target: {first: "TOP", second: "MIDDLE"}, arrow: {first: "BOTTOM", second: "MIDDLE"}},
    {target: {first: "BOTTOM", second: "MIDDLE"}, arrow: {first: "TOP", second: "MIDDLE"}},
    ]);
}