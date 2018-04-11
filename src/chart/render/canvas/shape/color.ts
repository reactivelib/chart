import {ICanvasChildShape} from "./index";
import {IColor} from "../../../../color/index";

export interface IShapeWithColor extends ICanvasChildShape{
    color: IColor;
}