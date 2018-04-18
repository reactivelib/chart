/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IXIntervalData} from "./range";
import {IColorable} from "./color";
import {ILabelData} from "./label";
import {ICategorical} from "./category";

export interface ICandlestick extends IXIntervalData{

    open: number;
    high: number;
    low: number;
    close: number;

}

export interface IVolumeCandlestick extends ICandlestick{
    volume: number;
}

export interface ICartesianXCandle extends ICandlestick, IColorable, ICategorical, ILabelData{

}

/**
 * @editor
 */
export interface ICartesianXCandleSetting extends IColorable, ILabelData{
    x?: number;
    open: number;
    high: number;
    low: number;
    close: number;
}