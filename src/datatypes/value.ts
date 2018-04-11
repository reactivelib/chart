import {IXIntervalData} from "./range";
import {IPoint} from "../geometry/point/index";
import {IColorable} from "./color";
import {IRadiusPoint} from "./radius";
import {ILabelData} from "./label";
import {ICategorical} from './category';

export interface IValueData extends IXIntervalData{
    
    x: number;
    y: number;
    
}

export interface ICartesianPoint extends IPoint, IColorable, IRadiusPoint, ILabelData, ICategorical{

}

export interface ICartesianXPoint extends ICartesianPoint, IXIntervalData{
    
}

/**
 * @editor
 */
export interface ICartesianXPointSetting extends IColorable, IRadiusPoint, ILabelData{
    x?: number;
    y: number;
    
}

export interface IValuePoint extends IColorable, ILabelData{
    y: number;
}