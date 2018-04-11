/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IXIntervalData} from "./range";
import {IColorable} from "./color";
import {ILabelData} from "./label";
import {ICategorical} from "./category";

export interface IIntervalData extends IXIntervalData{
    y: number;
    ye: number;
}

export interface ICartesianXInterval extends IIntervalData, IColorable, ICategorical{

}

/**
 * @editor
 */
export interface ICartesianXIntervalSetting extends IColorable, ILabelData{
    x?: number;
    y: number;
    ye: number;
}