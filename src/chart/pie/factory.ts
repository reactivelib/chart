/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IChartSettings} from "../core/basic";
import {array} from "@reactivelib/reactive";
import {IPieLabelSettings} from "./label";
import {IPieTooltipSettings} from "./tooltip";
import {IPieSeriesSettings} from "./series";
import {degreeToRadian} from "../../math/transform/polar";

export interface IPieChartSettings extends IChartSettings{

    label?: IPieLabelSettings;
    angleUnit?: "degree" | "radian";
    startAngle?: number;
    endAngle?: number;
    startRadius?: number;
    seriesDistance?: number;
    sliceDistance?: number;
    series?: IPieSeriesSettings[] | array.IReactiveArray<IPieSeriesSettings>;
    tooltip?: IPieTooltipSettings;

}

export function getAngleInRadian(angle: number, unit: "degree" | "radian"){
    if (unit === "degree"){
        return degreeToRadian(angle);
    }
    return angle;
}