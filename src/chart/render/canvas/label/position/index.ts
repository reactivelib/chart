/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IPositioned} from "../../../../../geometry/layout/rectangle/position/index";
import {IRectangleCanvasShape} from "../../shape/rectangle/index";
import {LabelType} from "../cache/index";

export interface IPositionedLabel extends IPositioned{

    label: LabelType;

}

export interface IRectangleLabel extends IPositionedLabel, IRectangleCanvasShape{

}